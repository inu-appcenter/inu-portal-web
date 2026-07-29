import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Bus, Plus, RefreshCw, Trash2, List } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import {
  getAdminRouteSections,
  autoSyncAdminRouteSections,
  deleteAdminRouteSection,
  getAdminTargetRules,
  addAdminTargetRule,
  deleteAdminTargetRule,
} from "@/apis/admin";

export default function MobileAdminBusPage() {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  useHeader({
    title: "버스 관리자 페이지",
    hasback: true,
  });

  const GO_SCHOOL_STOPS = [

    { name: "인천대입구역 2번출구", id: "164000395" },
    { name: "인천대입구역 1번출구", id: "164000396" },
    { name: "지식정보단지역 3번출구", id: "164000403" },
    { name: "인천대입구역.롯데몰", id: "164000648" },
  ];

  const GO_HOME_STOPS = [
    { name: "인천대 정문(길 건너)", id: "164000385" },
    { name: "인천대 공과대학", id: "164000377" },
    { name: "인천대 자연과학대학", id: "164000378" },
    { name: "인천대 송도캠퍼스(기숙사)", id: "164000751" },
  ];

  // 자동 탐색 룰 폼 상태
  const [ruleForm, setRuleForm] = useState({
    category: "go-school",
    tabName: "인입런",
    startBstopId: "164000395",
    startStopName: "인천대입구역 2번출구",
    targetKeywords: "정문,자연,공과,공대,송도캠",
  });

  const handleCategoryChange = (category: string) => {
    if (category === "go-school") {
      setRuleForm({
        category: "go-school",
        tabName: "인입런",
        startBstopId: "164000395",
        startStopName: "인천대입구역 2번출구",
        targetKeywords: "정문,자연,공과,공대,송도캠",
      });
    } else {
      setRuleForm({
        category: "go-home",
        tabName: "인천대 정문",
        startBstopId: "164000385",
        startStopName: "인천대 정문(길 건너)",
        targetKeywords: "인천대입구역,지식정보단지역,홍대입구",
      });
    }
  };

  const [routeSections, setRouteSections] = useState<any[]>([]);
  const [targetRules, setTargetRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem("tokenInfo"));
    if (!tokenInfo.accessToken && !hasStoredToken) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }
    if (tokenInfo.accessToken && userInfo.role && userInfo.role !== "admin") {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    loadData();
  }, [tokenInfo, userInfo, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routesRes, rulesRes] = await Promise.all([
        getAdminRouteSections(),
        getAdminTargetRules(),
      ]);
      setRouteSections(routesRes.data ?? []);
      setTargetRules(rulesRes.data ?? []);
    } catch (e) {
      console.error("버스 어드민 데이터 불러오기 실패", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRouteSection = async (id: number) => {
    if (!confirm("정말 이 노선 구간을 삭제하시겠습니까?")) return;
    try {
      await deleteAdminRouteSection(id);
      setMessage("노선 구간이 삭제되었습니다.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("노선 구간 삭제 실패.");
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.startBstopId.trim() || !ruleForm.startStopName.trim() || !ruleForm.targetKeywords.trim()) {
      alert("시작 정류소 ID, 정류장명, 목적지 키워드를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await addAdminTargetRule(ruleForm);
      setMessage("자동 탐색 타겟 규칙이 성공적으로 추가되었습니다!");
      loadData();
    } catch (err) {
      console.error(err);
      alert("자동 탐색 타겟 규칙 등록 실패.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("이 탐색 규칙을 삭제하시겠습니까?")) return;
    try {
      await deleteAdminTargetRule(id);
      setMessage("탐색 규칙이 삭제되었습니다.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("탐색 규칙 삭제 실패.");
    }
  };

  const handleAutoSync = async () => {
    if (!confirm("주요 정류장을 지나는 전체 버스 노선을 자동으로 탐색하고 구간을 슬라이싱하여 동기화하시겠습니까?")) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await autoSyncAdminRouteSections();
      setMessage(res.msg || "학교/하교 노선 전체 자동 탐색 및 동기화 완료!");

      loadData();
    } catch (err) {
      console.error(err);
      alert("자동 노선 동기화 실패.");
    } finally {
      setLoading(false);
    }
  };

  const currentPresetStops = ruleForm.category === "go-school" ? GO_SCHOOL_STOPS : GO_HOME_STOPS;

  return (
    <AdminLayout>
      <Container>
        {message && <SuccessBanner>{message}</SuccessBanner>}

        {/* 1. 원클릭 노선 전체 자동 탐색 & 동기화 섹션 */}
        <SectionCard>
          <HeaderRow>
            <Bus size={20} color="#3b82f6" />
            <SectionTitle>학교/하교 전체 노선 자동 탐색 및 동기화</SectionTitle>
          </HeaderRow>
          <Description>
            공공데이터포털 API 기반으로 "학교 갈래요" 및 "집 갈래요" 정류소를 지나는 버스 노선을 자동 감지하고 최장 구간으로 슬라이싱하여 동기화합니다.
          </Description>

          <AutoSyncBox>
            <AutoSyncTitle>⚡ 원클릭 노선 전체 자동 동기화</AutoSyncTitle>
            <AutoSyncDesc>
              주요 지하철역 및 학교 정류소를 지나가는 8번, 16번, 41번, 46번, 6번, 6-1번 등 모든 노선을 자동 탐색하여 학교/하교 최장 구간으로 슬라이싱합니다.
            </AutoSyncDesc>
            <AutoSyncButton type="button" onClick={handleAutoSync} disabled={loading}>
              <RefreshCw size={16} />
              {loading ? "자동 탐색 및 분석 중..." : "전체 노선 자동 탐색 및 동기화 실행"}
            </AutoSyncButton>
          </AutoSyncBox>
        </SectionCard>

        {/* 2. 등록된 동적 노선 목록 섹션 */}
        <SectionCard>
          <HeaderRow>
            <List size={20} color="#10b981" />
            <SectionTitle>등록된 동적 노선 목록 ({routeSections.length}개)</SectionTitle>
            <RefreshButton onClick={loadData} style={{ marginLeft: "auto" }}>
              <RefreshCw size={14} /> 새로고침
            </RefreshButton>
          </HeaderRow>

          <RouteList>
            {routeSections.map((sec) => (
              <RouteItem key={sec.id}>
                <ItemInfo>
                  <strong>{sec.sectionName}</strong>
                  <Badge>{sec.category}</Badge>
                  <Badge style={{ background: "#dbeafe", color: "#1e40af" }}>
                    {sec.tabName}
                  </Badge>
                  <SubText>
                    [{sec.routeNo}번] {sec.startBstopName ?? sec.startBstopId} →{" "}
                    {sec.endBstopName ?? sec.endBstopId} ({sec.stops?.length ?? 0}개 정류장)
                  </SubText>
                </ItemInfo>
                <DeleteButton onClick={() => handleDeleteRouteSection(sec.id)}>
                  <Trash2 size={16} color="#ef4444" />
                </DeleteButton>
              </RouteItem>
            ))}
            {routeSections.length === 0 && (
              <EmptyText>현재 등록된 동적 노선 구간이 없습니다.</EmptyText>
            )}
          </RouteList>
        </SectionCard>

        {/* 3. 자동 탐색 타겟 규칙 관리 섹션 */}
        <SectionCard>
          <HeaderRow>
            <RefreshCw size={20} color="#8b5cf6" />
            <SectionTitle>자동 탐색 타겟 규칙 (학교/하교 시종점 & 키워드)</SectionTitle>
          </HeaderRow>
          <Description>
            "학교 갈래요" 및 "집 갈래요"의 각 탭별 시작 정류소와 종점 탐색 키워드를 관리합니다. 원클릭 동기화 버튼 실행 시 이 규칙을 바탕으로 노선이 자동 슬라이싱됩니다.
          </Description>

          <Form onSubmit={handleRuleSubmit}>
            <FormRow>
              <FormGroup>
                <Label>카테고리</Label>
                <Select
                  value={ruleForm.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="go-school">학교 갈래요 (go-school)</option>
                  <option value="go-home">집 갈래요 (go-home)</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>탭명 (분류)</Label>
                <Input
                  type="text"
                  placeholder="예: 인입런, 지정단런, 인천대 정문"
                  value={ruleForm.tabName}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, tabName: e.target.value })
                  }
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>시작 정류장 선택 (추천 목록)</Label>
              <Select
                value={`${ruleForm.startStopName} (${ruleForm.startBstopId})`}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = currentPresetStops.find(
                    (s) => `${s.name} (${s.id})` === val,
                  );
                  if (matched) {
                    setRuleForm({
                      ...ruleForm,
                      startBstopId: matched.id,
                      startStopName: matched.name,
                    });
                  }
                }}
              >
                {currentPresetStops.map((s) => (
                  <option key={`rule-stop-${s.id}`} value={`${s.name} (${s.id})`}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>정류소 ID (bstopId)</Label>
                <Input
                  type="text"
                  placeholder="예: 164000395"
                  value={ruleForm.startBstopId}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, startBstopId: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>정류장 명칭</Label>
                <Input
                  type="text"
                  placeholder="예: 인천대입구역 2번출구"
                  value={ruleForm.startStopName}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, startStopName: e.target.value })
                  }
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>목적지 키워드 목록 (콤마 구분)</Label>
              <Input
                type="text"
                placeholder={
                  ruleForm.category === "go-school"
                    ? "예: 정문,자연,공과,공대,송도캠"
                    : "예: 인천대입구역,지식정보단지역,홍대입구"
                }
                value={ruleForm.targetKeywords}
                onChange={(e) =>
                  setRuleForm({ ...ruleForm, targetKeywords: e.target.value })
                }
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={loading} style={{ background: "#8b5cf6" }}>
              <Plus size={16} />
              {loading ? "등록 중..." : "탐색 규칙 추가하기"}
            </SubmitButton>
          </Form>

          <SubTitleRow>
            <h4>
              <List size={16} style={{ display: "inline", marginRight: 4 }} />
              등록된 탐색 규칙 목록 ({targetRules.length}개)
            </h4>
          </SubTitleRow>

          <RouteList>
            {targetRules.map((rule) => (
              <RouteItem key={rule.id}>
                <ItemInfo>
                  <strong>[{rule.category}] {rule.tabName}</strong>
                  <Badge style={{ background: "#f3e8ff", color: "#6b21a8" }}>
                    시작: {rule.startStopName} ({rule.startBstopId})
                  </Badge>
                  <SubText>
                    목적지 키워드: {rule.targetKeywords}
                  </SubText>
                </ItemInfo>
                <DeleteButton onClick={() => handleDeleteRule(rule.id)}>
                  <Trash2 size={16} color="#ef4444" />
                </DeleteButton>
              </RouteItem>
            ))}
            {targetRules.length === 0 && (
              <EmptyText>현재 등록된 자동 탐색 규칙이 없습니다.</EmptyText>
            )}
          </RouteList>
        </SectionCard>
      </Container>
    </AdminLayout>
  );
}




const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SuccessBanner = styled.div`
  background: #ecfdf5;
  border: 1px solid #10b981;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
`;

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Description = styled.p`
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  outline: none;
  background: #ffffff;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 10px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 6px;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  margin-bottom: 12px;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
`;

const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RouteItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
`;

const ItemInfo = styled.div`

  font-size: 13px;
  color: #334155;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const SubText = styled.span`
  display: block;
  width: 100%;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const Badge = styled.span`
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: #fee2e2;
  }
`;

const AutoSyncBox = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AutoSyncTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 4px;
`;

const AutoSyncDesc = styled.div`
  font-size: 12px;
  color: #3b82f6;
  line-height: 1.4;
  margin-bottom: 12px;
`;

const AutoSyncButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyText = styled.p`

  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  padding: 16px;
  margin: 0;
`;
