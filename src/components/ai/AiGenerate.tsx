// AiGenerate.tsx
import styled from "styled-components";
import {postFiresPredict} from "apis/fires";
import axios, {AxiosError} from "axios";
import {useRef, useState, useEffect} from "react";
import useUserStore from "stores/useUserStore";
import AiGallery from "components/ai/AiGallery";
import {result} from "apis/genTorch";
import {openDB} from "idb"; // IndexedDB 사용
import useMobileNavigate from "hooks/useMobileNavigate";

export default function AiGenerate() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [eta, setEta] = useState<number>(0);
    const [canRefresh, setCanRefresh] = useState<boolean>(false);
    const [requestId, setRequestId] = useState<string | null>(null);
    const {tokenInfo} = useUserStore();
    const mobileNavigate = useMobileNavigate();

    const [newImageGenerated, setNewImageGenerated] = useState(false);

    // IndexedDB 초기화
    const initDB = async () => {
        return openDB("ImageDB", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("images")) {
                    db.createObjectStore("images");
                }
            },
        });
    };

    // IndexedDB에서 이미지 가져오기
    const getImageFromIndexedDB = async (
        requestId: string
    ): Promise<string | null> => {
        const db = await initDB();
        return (await db.get("images", requestId)) || null;
    };

    // IndexedDB에 이미지 저장
    const saveImageToIndexedDB = async (requestId: string, b64Img: string) => {
        const db = await initDB();
        await db.put("images", b64Img, requestId);
    };

    // ETA 감소를 위한 useEffect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (eta > 0) {
            interval = setInterval(() => {
                setEta((prevEta) => {
                    if (prevEta <= 1) {
                        clearInterval(interval);
                        setCanRefresh(true);
                        return 0;
                    } else {
                        return prevEta - 1;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [eta]);

    const translate = async (koreanText: string): Promise<string> => {
        const apiKey = import.meta.env.VITE_API_KEY;

        const text = koreanText;
        const targetLanguage = 'en';  // 한국어로 번역

        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

        const requestBody = {
            q: text,
            target: targetLanguage
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            const translatedText = data.data.translations[0].translatedText;
            console.log('Translated Text:', translatedText);

            alert(translatedText + "(으)로 번역되어 횃불이 이미지가 생성됩니다.");

            return translatedText;  // 번역 결과 반환
        } catch (error) {
            console.error('Error:', error);
            alert("번역하는 중 오류가 발생했어요! 영어로 직접 입력해주세요.");
            return "";  // 오류 발생 시 빈 문자열 반환
        }
    };

    const handleGenerateClick = async () => {
        if (loading) return;
        if (inputRef.current && !inputRef.current.value.trim()) {
            alert("명령어를 입력해주세요.");
            return;
        }
        if (!tokenInfo.accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        let inputValue = "";
        let translatedValue = "";
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (inputRef.current) {
            inputValue = inputRef.current.value;
            if (inputValue === '횃불이') {
                alert("‘횃불이’ 키워드는 사용할 수 없습니다. 예를 들어, '즐겁게 피아노 치는'과 같이 묘사해 주세요.");
                return; // '횃불이'만 입력된 경우 리턴
            }


            const cleanedValue = inputValue.replace(/횃불이/g, ''); // '횃불이'를 제거
            if (koreanRegex.test(cleanedValue)) {
                if (inputValue.length > 30) {
                    alert("한글은 30글자를 초과할 수 없습니다.");
                    return; // 30글자를 초과하는 경우 리턴
                }
                const result = await translate(cleanedValue);
                if (result === "") {
                    return;
                } else {
                    translatedValue = result;
                }
                // alert("한글은 지원되지 않습니다.");
                // return;
            }
        }


        // if (inputRef.current) {
        setLoading(true);
        setMainImage(null);
        setEta(0);
        setCanRefresh(false);
        setRequestId(null);

        try {
            // 명령어로 이미지 생성 요청
            console.log("생성 요청 시작");
            const response = await postFiresPredict(
                translatedValue === "" ? inputValue.trim() : translatedValue
            );
            console.log(response);
            const requestId = response.data.request_id;
            setRequestId(requestId);

            // IndexedDB에서 이미지가 있는지 확인
            const cachedImage = await getImageFromIndexedDB(requestId);
            if (cachedImage) {
                setMainImage(cachedImage);
                setLoading(false);
                return;
            }

            // 이미지 생성 결과 가져오기
            fetchResult(requestId);
        } catch (error) {
            console.error("이미지 생성 요청 실패", error);
            if (
                axios.isAxiosError(error) &&
                !(error as AxiosError & { isRefreshError?: boolean })
                    .isRefreshError &&
                error.response
            ) {
                //  alert("이미지 생성 요청 실패");
                alert("AI 이미지 서비스 점검 중입니다.");
            }
            setLoading(false);
        }
        // }
    };

    const fetchResult = async (requestId: string) => {
        try {
            const res = await result(requestId);
            if (res.status === 201 && res.body.b64_img) {
                const b64Img = res.body.b64_img;
                await saveImageToIndexedDB(requestId, b64Img);
                setMainImage(b64Img);
                setLoading(false);
                setEta(0);
                setCanRefresh(false);
            } else if (res.status === 202 || res.status === 203) {
                // ETA 설정
                if (res.body.eta) {
                    setEta(res.body.eta);
                } else {
                    // ETA가 없을 경우 기본값 설정 (예: 10초)
                    setEta(10);
                }
                setLoading(false);
                setCanRefresh(false);
            } else {
                alert("이미지 생성에 실패했습니다.");
                setLoading(false);
            }
        } catch (error) {
            console.error("이미지 생성 결과 가져오기 실패", error);
            setLoading(false);
        }
    };

    const handleRefreshClick = () => {
        // console.log(requestId);
        // window.location.reload();
        if (requestId) {
            setCanRefresh(false);
            setEta(0);
            setLoading(true);
            fetchResult(requestId);
            setNewImageGenerated(!newImageGenerated);
        }
    };

    return (
        <AiGenerateWrapper>
            <MainContainer>
                {loading ? (
                    <LoadingText>이미지를 불러오는 중입니다...</LoadingText>
                ) : mainImage ? (
                    <MainImage
                        src={`data:image/png;base64,${mainImage}`}
                        alt="AI 생성 이미지"
                    />
                ) : eta > 0 ? (
                    <EtaText>남은 시간: {Math.trunc(eta)}초</EtaText>
                ) : canRefresh ? (
                    <RefreshButton onClick={handleRefreshClick}>확인!</RefreshButton>
                ) : (
                    <Placeholder>생성된 이미지가 여기에 표시됩니다.</Placeholder>
                )}
            </MainContainer>
            <InputWrapper>
                <InputField
                    ref={inputRef}
                    placeholder="Surfing, hawaiian shirts, sunset"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            handleGenerateClick();
                        }
                    }}
                />
                {tokenInfo.accessToken ? (
                    !loading && !canRefresh && eta == 0 ? (
                        <GenerateButton onClick={handleGenerateClick}>
                            생성하기
                        </GenerateButton>
                    ) : (
                        <GenerateButton disabled={true}>생성 중</GenerateButton>
                    )
                ) : (
                    <>
                        <MobileLoginButton onClick={() => mobileNavigate("/login")}>
                            로그인
                        </MobileLoginButton>
                        <DesktopLoginButton href="/login">로그인</DesktopLoginButton>
                    </>
                )}
            </InputWrapper>
            {/* 하단 갤러리 */}
            <AiGallery newImageGenerated={newImageGenerated}/>
        </AiGenerateWrapper>
    );
}

const AiGenerateWrapper = styled.div`
    flex: 1;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const MainContainer = styled.div`
    width: 300px;
    height: 300px;
    background-color: #f0f0f0;
    border-radius: 12px;
    margin: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MainImage = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 12px;
`;

const Placeholder = styled.div`
    color: #333;
    font-size: 16px;
    text-align: center;
`;

const LoadingText = styled.div`
    color: #333;
    font-size: 16px;
    text-align: center;
`;

const EtaText = styled.div`
    color: #333;
    font-size: 16px;
    text-align: center;
`;

const RefreshButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    background-color: #6d4dc7;
    color: white;
    border: none;
    border-radius: 12px;
`;

const InputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
`;

const InputField = styled.input`
    width: 200px;
    height: 44px;
    padding: 0 12px;
    border: 1px solid white;
    border-radius: 12px;
    background: transparent;
    color: white;
    font-size: 16px;

    ::placeholder {
        color: white;
    }

    :focus {
        outline: none;
    }
`;

const GenerateButton = styled.button`
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    border: none;
    background: #6d4dc7;
    color: white;
    font-size: 16px;
    font-weight: bold;
`;

const MobileLoginButton = styled.button`
    display: flex;
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    border: none;
    background: #6d4dc7;
    color: white;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 1024px) {
        display: none;
    }
`;

const DesktopLoginButton = styled.a`
    display: flex;
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    border: none;
    background: #6d4dc7;
    color: white;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 1024px) {
        display: none;
    }
`;
