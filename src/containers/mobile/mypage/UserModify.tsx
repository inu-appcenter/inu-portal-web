import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { patchSchoolDepartment, putMembers } from "@/apis/members";
import useUserStore from "@/stores/useUserStore";
import {
  getSchoolDepartments,
  SchoolDepartment,
} from "@/apis/departments";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  normalizeOptionalText,
  normalizeProfileImageId,
} from "@/utils/userInfo";
import { UserInfoInput } from "@/types/members";

const PROFILE_IMAGE_IDS = Array.from({ length: 12 }, (_, index) => index + 1);
const MAX_NICKNAME_LENGTH = 10;

const FORBIDDEN_KEYWORDS = [
  "알림", "공지", "알람", "운영자", "운영진", "관리자", "시스템", "스태프", "어드민",
  "notice", "admin", "system", "staff", "intip", "인팁", "appcenter", "앱센터"
];

const checkForbiddenNickname = (nicknameText: string): boolean => {
  const normalized = nicknameText.replace(/\s+/g, "").toLowerCase();
  return FORBIDDEN_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()));
};

const getProfileImageUrl = (fireId: number) =>
  `https://portal.inuappcenter.kr/images/profile/${fireId}`;

export default function UserModify() {
  const { setUserInfo, userInfo } = useUserStore();
  const [nickname, setNickname] = useState(() =>
    normalizeOptionalText(userInfo.nickname),
  );
  const [fireId, setFireId] = useState(() =>
    normalizeProfileImageId(userInfo.fireId, DEFAULT_PROFILE_IMAGE_ID),
  );
  const [departmentCode, setDepartmentCode] = useState(() =>
    normalizeOptionalText(userInfo.departmentCode),
  );
  const [departments, setDepartments] = useState<SchoolDepartment[]>([]);
  const [isDepartmentLoading, setIsDepartmentLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setNickname(normalizeOptionalText(userInfo.nickname));
    setFireId(
      normalizeProfileImageId(userInfo.fireId, DEFAULT_PROFILE_IMAGE_ID),
    );
    setDepartmentCode(normalizeOptionalText(userInfo.departmentCode));
  }, [userInfo.departmentCode, userInfo.fireId, userInfo.nickname]);

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      try {
        const response = await getSchoolDepartments();
        if (isMounted) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("학과 목록 조회 실패", error);
        if (isMounted) {
          alert("학과 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (isMounted) {
          setIsDepartmentLoading(false);
        }
      }
    };

    void loadDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  const originalNickname = normalizeOptionalText(userInfo.nickname).trim();
  const originalDepartmentCode = normalizeOptionalText(userInfo.departmentCode);
  const trimmedNickname = normalizeOptionalText(nickname).trim();
  const selectedDepartment = departments.find(
    (item) => item.code === departmentCode,
  );
  const departmentName = selectedDepartment?.name ?? userInfo.department;
  const selectedFireId = normalizeProfileImageId(
    fireId,
    DEFAULT_PROFILE_IMAGE_ID,
  );
  const nicknameLength = nickname.length;
  const hasNicknameChanged = trimmedNickname !== originalNickname;
  const hasDepartmentChanged = departmentCode !== originalDepartmentCode;
  const hasValidDepartmentChange = hasDepartmentChanged && Boolean(departmentCode);
  const hasImageChanged =
    selectedFireId !==
    normalizeProfileImageId(userInfo.fireId, DEFAULT_PROFILE_IMAGE_ID);
  const hasChanges =
    hasNicknameChanged || hasValidDepartmentChange || hasImageChanged;

  const handleModifyClick = async () => {
    if (isSaving || !hasChanges) {
      return;
    }

    if (!trimmedNickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (checkForbiddenNickname(trimmedNickname)) {
      alert("사칭 방지를 위해 '알림', '운영진', '시스템' 등의 단어는 닉네임으로 설정할 수 없습니다.");
      return;
    }

    if (nicknameLength > MAX_NICKNAME_LENGTH) {
      alert("닉네임은 10자를 초과할 수 없습니다.");
      return;
    }

    try {
      setIsSaving(true);

      const updatedNickname = hasNicknameChanged ? trimmedNickname : null;
      let updatedUserInfo: UserInfoInput = {
        ...userInfo,
        nickname: updatedNickname ?? originalNickname,
        department: departmentName,
        departmentCode,
        fireId: selectedFireId,
      };

      if (hasNicknameChanged || hasImageChanged) {
        const response = await putMembers(updatedNickname, selectedFireId);
        updatedUserInfo = {
          ...updatedUserInfo,
          id: response.data,
        };
      }

      if (hasValidDepartmentChange) {
        const response = await patchSchoolDepartment(departmentCode);
        updatedUserInfo = response.data;
      }

      // 믹스패널 트래킹: 어떤 필드가 수정되었는지 기록
      const updatedFields: string[] = [];
      if (hasNicknameChanged) updatedFields.push("nickname");
      if (hasValidDepartmentChange) updatedFields.push("department");
      if (hasImageChanged) updatedFields.push("profile_image");

      if (updatedFields.length > 0) {
        mixpanelTrack.profileUpdated(updatedFields);
      }

      setUserInfo(updatedUserInfo);

      alert("성공적으로 수정되었습니다.");

      navigate("/mypage");
    } catch (error: any) {
      console.error("회원정보 수정 실패", error);
      const errorResponse = error.response?.data;
      const isForbiddenCode =
        errorResponse?.code === "INVALID_NICKNAME_KEYWORD" ||
        errorResponse?.status === "BAD_REQUEST";

      if (isForbiddenCode) {
        alert("사칭 방지를 위해 '알림', '운영진', '시스템' 등의 단어는 닉네임으로 설정할 수 없습니다.");
      } else {
        alert(errorResponse?.message || "회원정보 수정에 실패했습니다.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserModifyWrapper>
      <SectionCard>
        <SectionTop>
          <div>
            <h3>닉네임</h3>
            <p>커뮤니티와 마이페이지에 표시되는 이름이에요.</p>
          </div>
          <Counter>
            {nicknameLength}/{MAX_NICKNAME_LENGTH}
          </Counter>
        </SectionTop>

        <StyledInput
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임을 입력해주세요"
          maxLength={MAX_NICKNAME_LENGTH}
        />
      </SectionCard>

      <SectionCard>
        <SectionTop>
          <div>
            <h3>학과(주전공)</h3>
            <p>추후 부/복수전공 선택 기능이 추가될 예정이에요.</p>
          </div>
        </SectionTop>

        <DepartmentSelect
          value={departmentCode}
          onChange={(event) => setDepartmentCode(event.target.value)}
          disabled={isDepartmentLoading}
        >
          <option value="">
            {isDepartmentLoading ? "학과 목록을 불러오는 중..." : "학과를 선택해주세요"}
          </option>
          {departments.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </DepartmentSelect>
      </SectionCard>

      <SectionCard>
        <SectionTop>
          <div>
            <h3>프로필 이미지</h3>
          </div>
        </SectionTop>

        <PreviewCard>
          <PreviewAvatar>
            <img
              src={getProfileImageUrl(selectedFireId)}
              alt="선택한 프로필 이미지"
            />
          </PreviewAvatar>
          <PreviewText>
            <strong>{trimmedNickname || "닉네임 없음"}</strong>
            <span>
              {departmentName || "학과를 아직 선택하지 않았어요."}
            </span>
          </PreviewText>
        </PreviewCard>

        <ImageSelection>
          {PROFILE_IMAGE_IDS.map((id) => {
            const isSelected = id === selectedFireId;

            return (
              <ImageOption
                key={id}
                type="button"
                $selected={isSelected}
                aria-pressed={isSelected}
                onClick={() => setFireId(id)}
              >
                <div className="image-frame">
                  <img
                    src={getProfileImageUrl(id)}
                    alt={`프로필 이미지 ${id}`}
                  />
                </div>
              </ImageOption>
            );
          })}
        </ImageSelection>
      </SectionCard>

      <SubmitArea>
        <SubmitButton
          type="button"
          $fullWidth
          disabled={!hasChanges || isSaving}
          onClick={handleModifyClick}
        >
          {isSaving ? "저장 중..." : "저장하기"}
        </SubmitButton>
      </SubmitArea>
    </UserModifyWrapper>
  );
}

const UserModifyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  /* 하단 고정 버튼 영역만큼 여백 확보 */
  padding-bottom: 120px;

  @media ${DESKTOP_MEDIA} {
    padding-bottom: 140px;
  }
`;

const SectionCard = styled.section`
  width: 100%;
  padding: 20px 18px;
  box-sizing: border-box;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 10px 30px rgba(39, 94, 180, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(232, 239, 248, 0.95);
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media ${DESKTOP_MEDIA} {
    padding: 24px 22px;
  }
`;

const SectionTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #1e355a;
  }

  p {
    margin: 6px 0 0;
    color: #6980a1;
    font-size: 13px;
    line-height: 1.55;
  }
`;

const Counter = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eff5ff;
  color: #4274c4;
  font-size: 12px;
  font-weight: 800;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 15px 16px;
  box-sizing: border-box;
  border-radius: 16px;
  color: #21324c;
  font-size: 15px;
  font-weight: 700;
  background: #f8fbff;
  border: 1px solid #dce8f6;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5e92f0;
    box-shadow: 0 0 0 4px rgba(94, 146, 240, 0.12);
    background: #ffffff;
  }

  &::placeholder {
    color: #9aa9bd;
  }

  &[readonly] {
    color: #51657f;
    cursor: pointer;
  }
`;

const DepartmentSelect = styled.select`
  width: 100%;
  padding: 15px 44px 15px 16px;
  box-sizing: border-box;
  border-radius: 16px;
  color: #21324c;
  font-size: 15px;
  font-weight: 700;
  background: #f8fbff;
  border: 1px solid #dce8f6;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5e92f0;
    box-shadow: 0 0 0 4px rgba(94, 146, 240, 0.12);
    background: #ffffff;
  }

  &:disabled {
    cursor: default;
    color: #9aa9bd;
  }
`;

const PreviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #eef5ff 0%, #f7fbff 100%);
  border: 1px solid rgba(211, 225, 243, 0.95);
`;

const PreviewAvatar = styled.div`
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 8px 18px rgba(64, 113, 185, 0.12);
  }
`;

const PreviewText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  strong {
    color: #1e355a;
    font-size: 16px;
    font-weight: 800;
    word-break: break-all;
  }

  span {
    color: #6e84a1;
    font-size: 13px;
    line-height: 1.45;
    word-break: break-word;
  }
`;

const ImageSelection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 420px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ImageOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  min-width: 0;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:active {
    transform: scale(0.97);
  }

  .image-frame {
    width: 100%;
    max-width: 72px;
    aspect-ratio: 1 / 1;
  }

  .image-frame img {
    width: 100%;
    height: 100%;
    border: 3px solid
      ${({ $selected }) => ($selected ? "#7ea9f3" : "transparent")};
    border-radius: 50%;
    display: block;
    object-fit: cover;
    box-sizing: border-box;
    box-shadow: ${({ $selected }) =>
      $selected
        ? "0 12px 22px rgba(94, 146, 240, 0.18)"
        : "0 6px 14px rgba(15, 23, 42, 0.08)"};
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }
`;

const SubmitArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  /* 내부 여백은 유지하여 버튼이 벽에 붙지 않게 함 */
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-top: 1px solid rgba(232, 239, 248, 0.9);
  z-index: 100;
`;

const ActionButton = styled.button<{ $fullWidth?: boolean }>`
  box-sizing: border-box;
  background: linear-gradient(135deg, #5e92f0 0%, #4a7fd0 100%);
  color: white;
  padding: 14px 18px;
  border-radius: 16px;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  min-width: 104px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 8px 18px rgba(94, 146, 240, 0.24);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;

  &:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(94, 146, 240, 0.24);
  }

  &:disabled {
    cursor: default;
    background: #dce8f6;
    color: #9aa9bd;
    box-shadow: none;
  }
`;

const SubmitButton = styled(ActionButton)`
  min-height: 54px;
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
`;
