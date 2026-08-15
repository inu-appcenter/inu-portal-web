import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Bus,
  Plus,
  RefreshCw,
  Trash2,
  List,
  Search,
  Edit2,
  Tag,
  X,
  ArrowRight,
  Check,
  Info,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import {
  getAdminRouteSections,
  autoSyncAdminRouteSections,
  deleteAdminRouteSection,
  updateAdminRouteSection,
  getAdminTargetRules,
  addAdminTargetRule,
  updateAdminTargetRule,
  deleteAdminTargetRule,
  searchAdminBusStops,
  getAdminStopAliases,
  saveAdminStopAlias,
  deleteAdminStopAlias,
} from "@/apis/admin";

export default function MobileAdminBusPage() {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  useHeader({
    title: "버스 관리자 페이지",
    hasback: true,
  });

  // 활성 탭 (rules | routes | aliases)
  const [activeTab, setActiveTab] = useState<"rules" | "routes" | "aliases">(
    "rules",
  );

  // 로딩 및 알림 상태
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 데이터 목록
  const [routeSections, setRouteSections] = useState<any[]>([]);
  const [targetRules, setTargetRules] = useState<any[]>([]);
  const [stopAliases, setStopAliases] = useState<any[]>([]);

  // 1. 규칙 등록/수정 폼 상태
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState({
    category: "go-school",
    tabName: "인입런",
    startBstopId: "",
    startStopName: "",
    startStopAlias: "",
    endBstopId: "",
    endBstopName: "",
    endStopAlias: "",
    targetKeywords: "",
  });

  // 2. 정류장 검색 모달 상태
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTargetType, setSearchTargetType] = useState<
    "start" | "end" | "alias"
  >("start");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // 3. 노선 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    sectionName: "",
    category: "go-school",
    tabName: "",
    busNotice: "",
    routeNotice: "",
  });

  // 4. 별칭 사전 등록 폼 상태
  const [aliasForm, setAliasForm] = useState({
    bstopId: "",
    bstopName: "",
    stopAlias: "",
    stopNotice: "",
    memo: "",
  });

  // 기존 등록된 고유 탭명 및 별칭 목록 (오타 방지용 제안 칩)
  const existingTabNames = Array.from(
    new Set([
      ...targetRules.map((r) => r.tabName).filter(Boolean),
      ...routeSections.map((s) => s.tabName).filter(Boolean),
      "인입런",
      "지정단런",
      "인천대 정문",
      "공대/자연대",
      "기숙사 앞",
    ]),
  );

  const existingAliases = Array.from(
    new Set([
      ...stopAliases.map((a) => a.stopAlias).filter(Boolean),
      ...targetRules.map((r) => r.startStopAlias).filter(Boolean),
      ...targetRules.map((r) => r.endStopAlias).filter(Boolean),
      "인입",
      "지정단",
      "정문",
      "공대",
      "자연대",
      "기숙사",
    ]),
  );

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
      const [routesRes, rulesRes, aliasesRes] = await Promise.all([
        getAdminRouteSections(),
        getAdminTargetRules(),
        getAdminStopAliases(),
      ]);
      setRouteSections(routesRes.data ?? []);
      setTargetRules(rulesRes.data ?? []);
      setStopAliases(aliasesRes.data ?? []);
    } catch (e) {
      console.error("버스 어드민 데이터 불러오기 실패", e);
    } finally {
      setLoading(false);
    }
  };

  // 정류장 검색 실행
  const handleSearchStops = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    setSearching(true);
    try {
      const res = await searchAdminBusStops(searchKeyword.trim());
      setSearchResults(res.data ?? []);
    } catch (err) {
      console.error(err);
      alert("정류소 검색에 실패했습니다.");
    } finally {
      setSearching(false);
    }
  };

  // 검색 모달 열기
  const openSearchModal = (target: "start" | "end" | "alias") => {
    setSearchTargetType(target);
    setSearchKeyword("");
    setSearchResults([]);
    setSearchModalOpen(true);
  };

  // 검색된 정류장 선택 시 적용
  const handleSelectStop = (stop: any) => {
    if (searchTargetType === "start") {
      setRuleForm((prev) => ({
        ...prev,
        startBstopId: stop.bstopId || "",
        startStopName: stop.bstopName || "",
        startStopAlias: stop.stopAlias || prev.startStopAlias || "",
      }));
    } else if (searchTargetType === "end") {
      setRuleForm((prev) => ({
        ...prev,
        endBstopId: stop.bstopId || "",
        endBstopName: stop.bstopName || "",
        endStopAlias: stop.stopAlias || prev.endStopAlias || "",
      }));
    } else if (searchTargetType === "alias") {
      setAliasForm((prev) => ({
        ...prev,
        bstopId: stop.bstopId || "",
        bstopName: stop.bstopName || "",
        stopAlias: stop.stopAlias || prev.stopAlias || "",
      }));
    }
    setSearchModalOpen(false);
  };

  // 탐색 룰 등록 및 수정
  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.startBstopId.trim() || !ruleForm.startStopName.trim()) {
      alert("출발 정류장 ID와 정류장명을 지정해주세요.");
      return;
    }

    const payload = {
      category: ruleForm.category,
      tabName: ruleForm.tabName,
      startBstopId: ruleForm.startBstopId.trim(),
      startStopName: ruleForm.startStopName.trim(),
      startStopAlias: ruleForm.startStopAlias.trim() || undefined,
      endBstopId: ruleForm.endBstopId.trim() || undefined,
      endBstopName: ruleForm.endBstopName.trim() || undefined,
      endStopAlias: ruleForm.endStopAlias.trim() || undefined,
      targetKeywords: ruleForm.targetKeywords.trim() || undefined,
    };

    setLoading(true);
    setMessage(null);
    try {
      if (editingRuleId !== null) {
        await updateAdminTargetRule(editingRuleId, payload);
        setMessage(`탐색 규칙 (#${editingRuleId})이 성공적으로 수정되었습니다!`);
        setEditingRuleId(null);
      } else {
        await addAdminTargetRule(payload as any);
        setMessage("자동 탐색 타겟 규칙이 성공적으로 추가되었습니다!");
      }
      setRuleForm({
        category: "go-school",
        tabName: "인입런",
        startBstopId: "",
        startStopName: "",
        startStopAlias: "",
        endBstopId: "",
        endBstopName: "",
        endStopAlias: "",
        targetKeywords: "",
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert("자동 탐색 타겟 규칙 저장 실패.");
    } finally {
      setLoading(false);
    }
  };

  // 룰 수정 모드 진입
  const handleEditRule = (rule: any) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      category: rule.category || "go-school",
      tabName: rule.tabName || "인입런",
      startBstopId: rule.startBstopId || "",
      startStopName: rule.startStopName || "",
      startStopAlias: rule.startStopAlias || "",
      endBstopId: rule.endBstopId || "",
      endBstopName: rule.endBstopName || rule.endStopName || "",
      endStopAlias: rule.endStopAlias || "",
      targetKeywords: rule.targetKeywords || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 룰 수정 취소
  const handleCancelEditRule = () => {
    setEditingRuleId(null);
    setRuleForm({
      category: "go-school",
      tabName: "인입런",
      startBstopId: "",
      startStopName: "",
      startStopAlias: "",
      endBstopId: "",
      endBstopName: "",
      endStopAlias: "",
      targetKeywords: "",
    });
  };


  // 룰 삭제
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

  // 전체 노선 자동 탐색 & 슬라이싱 동기화
  const handleAutoSync = async () => {
    if (
      !confirm(
        "등록된 규칙에 따라 공공데이터포털에서 전체 노선을 탐색하고 정밀 슬라이싱하여 동기화하시겠습니까?",
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await autoSyncAdminRouteSections();
      setMessage(res.msg || "노선 구간 전체 자동 탐색 및 동기화 완료!");
      loadData();
    } catch (err) {
      console.error(err);
      alert("자동 노선 동기화 실패.");
    } finally {
      setLoading(false);
    }
  };

  // 노선 수정 모달 열기
  const openEditModal = (sec: any) => {
    setEditingSection(sec);
    setEditForm({
      sectionName: sec.sectionName || "",
      category: sec.category || "go-school",
      tabName: sec.tabName || "",
      busNotice: sec.busNotice || "",
      routeNotice: sec.routeNotice || "",
    });
    setEditModalOpen(true);
  };

  // 노선 수정 저장
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setLoading(true);
    try {
      await updateAdminRouteSection(editingSection.id, editForm);
      setMessage(`'${editForm.sectionName}' 노선 정보가 수정되었습니다.`);
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("노선 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 노선 삭제
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

  // 별칭 저장
  const handleAliasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !aliasForm.bstopId.trim() ||
      !aliasForm.bstopName.trim() ||
      !aliasForm.stopAlias.trim()
    ) {
      alert("정류소 ID, 정류장명, 별칭을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await saveAdminStopAlias(aliasForm);
      setMessage(
        `'${aliasForm.bstopName}' 정류장의 별칭('${aliasForm.stopAlias}') 및 안내 문구가 저장되었습니다.`,
      );
      setAliasForm({ bstopId: "", bstopName: "", stopAlias: "", stopNotice: "", memo: "" });
      loadData();
    } catch (err) {
      console.error(err);
      alert("정류장 별칭 저장 실패.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAlias = (a: any) => {
    setAliasForm({
      bstopId: a.bstopId,
      bstopName: a.bstopName,
      stopAlias: a.stopAlias,
      stopNotice: a.stopNotice || "",
      memo: a.memo || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 별칭 삭제
  const handleDeleteAlias = async (id: number) => {

    if (!confirm("이 정류장 별칭을 삭제하시겠습니까?")) return;
    try {
      await deleteAdminStopAlias(id);
      setMessage("별칭이 삭제되었습니다.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("별칭 삭제 실패.");
    }
  };

  return (
    <AdminLayout>
      <Container>
        {message && <SuccessBanner>{message}</SuccessBanner>}

        {/* 상단 탭 네비게이션 */}
        <TabHeader>
          <TabButton
            active={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
          >
            <RefreshCw size={16} /> 1. 자동 탐색 룰 & 동기화 ({targetRules.length})
          </TabButton>
          <TabButton
            active={activeTab === "routes"}
            onClick={() => setActiveTab("routes")}
          >
            <Bus size={16} /> 2. 노선 목록 & 직접 수정 ({routeSections.length})
          </TabButton>
          <TabButton
            active={activeTab === "aliases"}
            onClick={() => setActiveTab("aliases")}
          >
            <Tag size={16} /> 3. 정류장 별칭 사전 ({stopAliases.length})
          </TabButton>
        </TabHeader>

        {/* ======================================================== */}
        {/* 탭 1: 자동 탐색 규칙 및 동기화 */}
        {/* ======================================================== */}
        {activeTab === "rules" && (
          <>
            {/* 원클릭 동기화 배너 */}
            <Card>
              <CardHeader>
                <HeaderTitle>
                  <RefreshCw size={20} color="#2563eb" /> 원클릭 노선 전체 자동
                  동기화
                </HeaderTitle>
              </CardHeader>
              <CardBody>
                <CardDesc>
                  아래 등록된 시종점 규칙들을 기반으로 인천 버스 공공데이터에서
                  경유 노선을 자동 탐색하고 정밀 슬라이싱하여 실시간 노선 DB를
                  최신화합니다.
                </CardDesc>
                <SyncButton onClick={handleAutoSync} disabled={loading}>
                  <RefreshCw
                    size={16}
                    className={loading ? "spin" : undefined}
                  />
                  {loading ? "노선 탐색 & 동기화 중..." : "전체 노선 자동 탐색 및 동기화 실행"}
                </SyncButton>
              </CardBody>
            </Card>

            {/* 시종점 기반 탐색 규칙 추가/수정 폼 */}
            <Card>
              <CardHeader>
                <HeaderTitle>
                  {editingRuleId !== null ? (
                    <>
                      <Edit2 size={20} color="#2563eb" /> 탐색 규칙 수정 (ID: #{editingRuleId})
                    </>
                  ) : (
                    <>
                      <Plus size={20} color="#16a34a" /> 시종점 기반 자동 탐색 규칙 추가
                    </>
                  )}
                </HeaderTitle>
                {editingRuleId !== null && (
                  <CancelMiniButton type="button" onClick={handleCancelEditRule}>
                    <X size={14} /> 수정 취소
                  </CancelMiniButton>
                )}
              </CardHeader>
              <CardBody>
                <form onSubmit={handleRuleSubmit}>
                  <FormGrid>
                    <FormGroup>
                      <Label>카테고리</Label>
                      <Select
                        value={ruleForm.category}
                        onChange={(e) =>
                          setRuleForm((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      >
                        <option value="go-school">학교 갈래요 (등교)</option>
                        <option value="go-home">집 갈래요 (하교)</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>탭 명 (직접 입력 또는 아래 칩 선택)</Label>
                      <Input
                        type="text"
                        list="tab-suggestions"
                        value={ruleForm.tabName}
                        onChange={(e) =>
                          setRuleForm((prev) => ({
                            ...prev,
                            tabName: e.target.value,
                          }))
                        }
                        placeholder="예: 인입런, 지정단런, 인천대 정문"
                        required
                      />
                      <datalist id="tab-suggestions">
                        {existingTabNames.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                      {existingTabNames.length > 0 && (
                        <ChipContainer>
                          <ChipLabel>추천 탭:</ChipLabel>
                          {existingTabNames.map((t) => (
                            <ChipButton
                              key={t}
                              type="button"
                              isSelected={ruleForm.tabName === t}
                              onClick={() =>
                                setRuleForm((prev) => ({ ...prev, tabName: t }))
                              }
                            >
                              {t}
                            </ChipButton>
                          ))}
                        </ChipContainer>
                      )}
                    </FormGroup>
                  </FormGrid>

                  {/* 출발 정류장 & 도착 정류장 선택 / 수기 입력 영역 */}
                  <StopSelectionGrid>
                    {/* 출발 정류소 */}
                    <StopSelectBox>
                      <BoxHeaderRow>
                        <BoxLabel>🚩 출발 정류장 (기점)</BoxLabel>
                        <SearchTriggerButton
                          type="button"
                          onClick={() => openSearchModal("start")}
                        >
                          <Search size={13} /> 공공데이터 검색
                        </SearchTriggerButton>
                      </BoxHeaderRow>

                      <ManualInputGrid>
                        <FormGroup>
                          <SubLabel>정류소 ID (9자리/번호)</SubLabel>
                          <Input
                            type="text"
                            value={ruleForm.startBstopId}
                            onChange={(e) =>
                              setRuleForm((prev) => ({
                                ...prev,
                                startBstopId: e.target.value,
                              }))
                            }
                            placeholder="예: 164000395"
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <SubLabel>정류소 명칭</SubLabel>
                          <Input
                            type="text"
                            value={ruleForm.startStopName}
                            onChange={(e) =>
                              setRuleForm((prev) => ({
                                ...prev,
                                startStopName: e.target.value,
                              }))
                            }
                            placeholder="예: 인천대입구역 2번출구"
                            required
                          />
                        </FormGroup>
                      </ManualInputGrid>

                      <FormGroup>
                        <SubLabel>출발지 별칭 (화면 표시용):</SubLabel>
                        <Input
                          type="text"
                          value={ruleForm.startStopAlias}
                          onChange={(e) =>
                            setRuleForm((prev) => ({
                              ...prev,
                              startStopAlias: e.target.value,
                            }))
                          }
                          placeholder="예: 인입, 지정단"
                        />
                        {existingAliases.length > 0 && (
                          <ChipContainer>
                            <ChipLabel>추천 별칭:</ChipLabel>
                            {existingAliases.map((a) => (
                              <ChipButton
                                key={a}
                                type="button"
                                isSelected={ruleForm.startStopAlias === a}
                                onClick={() => {
                                  // 해당 별칭에 매칭되는 정류장 사전 정보가 있으면 ID/명칭도 자동 보조 채움
                                  const matched = stopAliases.find(
                                    (sa) => sa.stopAlias === a,
                                  );
                                  setRuleForm((prev) => ({
                                    ...prev,
                                    startStopAlias: a,
                                    startBstopId:
                                      prev.startBstopId || matched?.bstopId || "",
                                    startStopName:
                                      prev.startStopName || matched?.bstopName || "",
                                  }));
                                }}
                              >
                                {a}
                              </ChipButton>
                            ))}
                          </ChipContainer>
                        )}
                      </FormGroup>
                    </StopSelectBox>

                    {/* 도착 정류소 */}
                    <StopSelectBox>
                      <BoxHeaderRow>
                        <BoxLabel>🏁 목표 도착 정류장 (종점)</BoxLabel>
                        <SearchTriggerButton
                          type="button"
                          onClick={() => openSearchModal("end")}
                        >
                          <Search size={13} /> 공공데이터 검색
                        </SearchTriggerButton>
                      </BoxHeaderRow>

                      <ManualInputGrid>
                        <FormGroup>
                          <SubLabel>정류소 ID (선택)</SubLabel>
                          <Input
                            type="text"
                            value={ruleForm.endBstopId}
                            onChange={(e) =>
                              setRuleForm((prev) => ({
                                ...prev,
                                endBstopId: e.target.value,
                              }))
                            }
                            placeholder="예: 164000378"
                          />
                        </FormGroup>
                        <FormGroup>
                          <SubLabel>정류소 명칭</SubLabel>
                          <Input
                            type="text"
                            value={ruleForm.endBstopName}
                            onChange={(e) =>
                              setRuleForm((prev) => ({
                                ...prev,
                                endBstopName: e.target.value,
                              }))
                            }
                            placeholder="예: 인천대학교 자연과학대학"
                          />
                        </FormGroup>
                      </ManualInputGrid>

                      <FormGroup>
                        <SubLabel>도착지 별칭 (화면 표시용):</SubLabel>
                        <Input
                          type="text"
                          value={ruleForm.endStopAlias}
                          onChange={(e) =>
                            setRuleForm((prev) => ({
                              ...prev,
                              endStopAlias: e.target.value,
                            }))
                          }
                          placeholder="예: 자연대, 공대"
                        />
                        {existingAliases.length > 0 && (
                          <ChipContainer>
                            <ChipLabel>추천 별칭:</ChipLabel>
                            {existingAliases.map((a) => (
                              <ChipButton
                                key={a}
                                type="button"
                                isSelected={ruleForm.endStopAlias === a}
                                onClick={() => {
                                  const matched = stopAliases.find(
                                    (sa) => sa.stopAlias === a,
                                  );
                                  setRuleForm((prev) => ({
                                    ...prev,
                                    endStopAlias: a,
                                    endBstopId:
                                      prev.endBstopId || matched?.bstopId || "",
                                    endBstopName:
                                      prev.endBstopName || matched?.bstopName || "",
                                  }));
                                }}
                              >
                                {a}
                              </ChipButton>
                            ))}
                          </ChipContainer>
                        )}
                      </FormGroup>
                    </StopSelectBox>
                  </StopSelectionGrid>

                  <ButtonGroup>
                    <SubmitButton type="submit" disabled={loading}>
                      {editingRuleId !== null ? (
                        <>
                          <Check size={16} /> 탐색 규칙 수정 완료 (#ID: {editingRuleId})
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> 새 규칙 등록하기
                        </>
                      )}
                    </SubmitButton>
                    {editingRuleId !== null && (
                      <CancelButton type="button" onClick={handleCancelEditRule}>
                        수정 취소
                      </CancelButton>
                    )}
                  </ButtonGroup>
                </form>
              </CardBody>
            </Card>

            {/* 등록된 탐색 룰 목록 */}
            <Card>
              <CardHeader>
                <HeaderTitle>
                  <List size={20} color="#6b7280" /> 등록된 탐색 규칙 목록 (
                  {targetRules.length}개)
                </HeaderTitle>
              </CardHeader>
              <CardBody>
                {targetRules.length === 0 ? (
                  <EmptyText>등록된 탐색 규칙이 없습니다.</EmptyText>
                ) : (
                  <RuleList>
                    {targetRules.map((rule) => (
                      <RuleItem key={rule.id}>
                        <RuleContent>
                          <Badge
                            isSchool={rule.category === "go-school"}
                          >
                            {rule.category === "go-school"
                              ? "학교 갈래요"
                              : "집 갈래요"}
                          </Badge>
                          <TabBadge>{rule.tabName}</TabBadge>
                          <RulePath>
                            <PathStop>
                              <b>{rule.startStopName}</b>{" "}
                              <SmallId>({rule.startBstopId})</SmallId>
                              {rule.startStopAlias && (
                                <AliasTag>[{rule.startStopAlias}]</AliasTag>
                              )}
                            </PathStop>
                            <ArrowRight size={14} color="#9ca3af" />
                            <PathStop>
                              <b>{rule.endBstopName || "목표 키워드 매칭"}</b>{" "}
                              {rule.endBstopId && (
                                <SmallId>({rule.endBstopId})</SmallId>
                              )}
                              {rule.endStopAlias && (
                                <AliasTag>[{rule.endStopAlias}]</AliasTag>
                              )}
                            </PathStop>
                          </RulePath>
                        </RuleContent>
                        <RuleActionGroup>
                          <EditRuleButton
                            type="button"
                            onClick={() => handleEditRule(rule)}
                            title="규칙 수정"
                          >
                            <Edit2 size={15} /> 수정
                          </EditRuleButton>
                          <DeleteButton
                            onClick={() => handleDeleteRule(rule.id)}
                            title="규칙 삭제"
                          >
                            <Trash2 size={15} />
                          </DeleteButton>
                        </RuleActionGroup>
                      </RuleItem>
                    ))}
                  </RuleList>
                )}
              </CardBody>
            </Card>

          </>
        )}

        {/* ======================================================== */}
        {/* 탭 2: 등록된 노선 목록 및 직접 수정 (Edit) */}
        {/* ======================================================== */}
        {activeTab === "routes" && (
          <Card>
            <CardHeader>
              <HeaderTitle>
                <Bus size={20} color="#2563eb" /> 등록된 노선 구간 목록 및 직접
                수정 ({routeSections.length}개)
              </HeaderTitle>
            </CardHeader>
            <CardBody>
              {routeSections.length === 0 ? (
                <EmptyText>
                  등록된 노선 구간이 없습니다. 1번 탭에서 [자동 동기화]를
                  실행해주세요.
                </EmptyText>
              ) : (
                <RouteGrid>
                  {routeSections.map((sec) => (
                    <RouteCard key={sec.id}>
                      <RouteHeader>
                        <RouteNoBadge>{sec.routeNo}번</RouteNoBadge>
                        <TabBadge>{sec.tabName}</TabBadge>
                        <Badge isSchool={sec.category === "go-school"}>
                          {sec.category === "go-school" ? "학교" : "집"}
                        </Badge>
                      </RouteHeader>

                      <SectionTitleText>{sec.sectionName}</SectionTitleText>

                      <RoutePathText>
                        <span>{sec.startBstopName}</span>
                        <ArrowRight size={12} />
                        <span>{sec.endBstopName}</span>
                      </RoutePathText>

                      <StopCountBadge>
                        경유 정류소: {sec.stops?.length ?? 0}개
                      </StopCountBadge>

                      {sec.busNotice && (
                        <NoticeBox>
                          <Info size={12} />
                          <span>{sec.busNotice}</span>
                        </NoticeBox>
                      )}

                      {sec.routeNotice ? (
                        <TipBox>
                          <b>💡 운행 팁:</b> {sec.routeNotice}
                        </TipBox>
                      ) : (
                        <NoTipText>💡 등록된 팁 코멘트 없음</NoTipText>
                      )}

                      <ActionRow>
                        <EditButton onClick={() => openEditModal(sec)}>
                          <Edit2 size={14} /> 팁/정보 수정
                        </EditButton>
                        <DeleteButton
                          onClick={() => handleDeleteRouteSection(sec.id)}
                        >
                          <Trash2 size={14} />
                        </DeleteButton>
                      </ActionRow>
                    </RouteCard>
                  ))}
                </RouteGrid>
              )}
            </CardBody>
          </Card>
        )}

        {/* ======================================================== */}
        {/* 탭 3: 주요 정류장 별칭(Alias) 사전 관리 */}
        {/* ======================================================== */}
        {activeTab === "aliases" && (
          <>
            <Card>
              <CardHeader>
                <HeaderTitle>
                  <Tag size={20} color="#8b5cf6" /> 정류장 별칭(Alias) 등록
                </HeaderTitle>
              </CardHeader>
              <CardBody>
                <CardDesc>
                  주요 정류소에 대해 모바일 화면에 표시될 짧은 축약명(예:
                  '인입', '정문', '공대', '자연대')을 등록해두면, 노선
                  fetching 및 맵 화면에 자동 매핑됩니다.
                </CardDesc>

                <form onSubmit={handleAliasSubmit}>
                  <FormGrid>
                    <FormGroup>
                      <Label>정류장 검색 / 선택</Label>
                      <SearchTriggerButton
                        type="button"
                        onClick={() => openSearchModal("alias")}
                      >
                        <Search size={14} />{" "}
                        {aliasForm.bstopName
                          ? `${aliasForm.bstopName} (${aliasForm.bstopId})`
                          : "공공데이터 정류소 검색하기"}
                      </SearchTriggerButton>
                    </FormGroup>

                    <FormGroup>
                      <Label>정류소 ID (공공데이터)</Label>
                      <Input
                        type="text"
                        value={aliasForm.bstopId}
                        onChange={(e) =>
                          setAliasForm((prev) => ({
                            ...prev,
                            bstopId: e.target.value,
                          }))
                        }
                        placeholder="예: 164000395"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>공식 정류소 명칭</Label>
                      <Input
                        type="text"
                        value={aliasForm.bstopName}
                        onChange={(e) =>
                          setAliasForm((prev) => ({
                            ...prev,
                            bstopName: e.target.value,
                          }))
                        }
                        placeholder="예: 인천대입구역 2번출구"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>별칭 / 축약명 (화면 노출용)</Label>
                      <Input
                        type="text"
                        list="alias-suggestions"
                        value={aliasForm.stopAlias}
                        onChange={(e) =>
                          setAliasForm((prev) => ({
                            ...prev,
                            stopAlias: e.target.value,
                          }))
                        }
                        placeholder="예: 인입, 지정단, 정문, 공대, 자연대"
                        required
                      />
                      <datalist id="alias-suggestions">
                        {existingAliases.map((a) => (
                          <option key={a} value={a} />
                        ))}
                      </datalist>
                      {existingAliases.length > 0 && (
                        <ChipContainer>
                          <ChipLabel>추천 별칭:</ChipLabel>
                          {existingAliases.map((a) => (
                            <ChipButton
                              key={a}
                              type="button"
                              isSelected={aliasForm.stopAlias === a}
                              onClick={() =>
                                setAliasForm((prev) => ({
                                  ...prev,
                                  stopAlias: a,
                                }))
                              }
                            >
                              {a}
                            </ChipButton>
                          ))}
                        </ChipContainer>
                      )}
                    </FormGroup>


                    <FormGroup style={{ gridColumn: "1 / -1" }}>
                      <Label>💡 정류장 상단 실시간 안내 문구 (stopNotice)</Label>
                      <TextArea
                        rows={2}
                        value={aliasForm.stopNotice}
                        onChange={(e) =>
                          setAliasForm((prev) => ({
                            ...prev,
                            stopNotice: e.target.value,
                          }))
                        }
                        placeholder="예: ※ 8시 ~ 10시에는 매우 혼잡해요. 계단에서 줄서기를 꼭 지켜주세요."
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: "1 / -1" }}>
                      <Label>메모 / 설명 (어드민 내부용)</Label>
                      <Input
                        type="text"
                        value={aliasForm.memo}
                        onChange={(e) =>
                          setAliasForm((prev) => ({
                            ...prev,
                            memo: e.target.value,
                          }))
                        }
                        placeholder="예: 인입런 출발 정류소"
                      />
                    </FormGroup>
                  </FormGrid>

                  <SubmitButton type="submit" disabled={loading}>
                    <Plus size={16} /> 별칭 및 안내 문구 저장하기
                  </SubmitButton>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <HeaderTitle>
                  <List size={20} color="#6b7280" /> 등록된 정류장 별칭 및 안내 문구 목록 (
                  {stopAliases.length}개)
                </HeaderTitle>
              </CardHeader>
              <CardBody>
                {stopAliases.length === 0 ? (
                  <EmptyText>등록된 별칭이 없습니다.</EmptyText>
                ) : (
                  <AliasTable>
                    <thead>
                      <tr>
                        <th>정류소 ID</th>
                        <th>공식 정류소명</th>
                        <th>별칭 (Alias)</th>
                        <th>정류장 안내 문구 (stopNotice)</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stopAliases.map((a) => (
                        <tr key={a.id}>
                          <td>{a.bstopId}</td>
                          <td>{a.bstopName}</td>
                          <td>
                            <AliasTag>{a.stopAlias}</AliasTag>
                          </td>
                          <td style={{ fontSize: "12px", color: "#b45309" }}>
                            {a.stopNotice || <span style={{ color: "#9ca3af" }}>-</span>}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <EditButton
                                type="button"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => handleEditAlias(a)}
                              >
                                <Edit2 size={12} /> 수정
                              </EditButton>
                              <DeleteButton
                                onClick={() => handleDeleteAlias(a.id)}
                              >
                                <Trash2 size={14} />
                              </DeleteButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </AliasTable>
                )}
              </CardBody>
            </Card>

          </>
        )}

        {/* ======================================================== */}
        {/* 정류소 실시간 검색 모달 */}
        {/* ======================================================== */}
        {searchModalOpen && (
          <ModalOverlay onClick={() => setSearchModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Search size={18} /> 정류장 실시간 검색
                </ModalTitle>
                <CloseButton onClick={() => setSearchModalOpen(false)}>
                  <X size={18} />
                </CloseButton>
              </ModalHeader>

              <SearchForm onSubmit={handleSearchStops}>
                <SearchInput
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="정류장명, 단축번호(5자리), 별칭 입력 (예: 인천대입구, 38395, 인입)"
                  autoFocus
                />
                <SearchSubmitBtn type="submit" disabled={searching}>
                  {searching ? "검색 중..." : "검색"}
                </SearchSubmitBtn>
              </SearchForm>

              <SearchResultsList>
                {searchResults.length === 0 && !searching && (
                  <SearchGuideText>
                    정류장 이름, 5자리 단축번호 또는 별칭을 검색해주세요. (공공데이터포털 실시간 조회)
                  </SearchGuideText>
                )}
                {searchResults.map((stop) => (
                  <SearchResultItem
                    key={stop.bstopId}
                    onClick={() => handleSelectStop(stop)}
                  >
                    <ResultItemLeft>
                      <ResultStopName>{stop.bstopName}</ResultStopName>
                      <ResultStopMeta>
                        ID: {stop.bstopId} | 단축번호: {stop.bstopNo || "-"} |{" "}
                        {stop.adminNm || "인천"}
                      </ResultStopMeta>
                    </ResultItemLeft>
                    <ResultItemRight>
                      {stop.stopAlias && (
                        <AliasTag>[{stop.stopAlias}]</AliasTag>
                      )}
                      <SelectStopBtn type="button">
                        <Check size={14} /> 선택
                      </SelectStopBtn>
                    </ResultItemRight>
                  </SearchResultItem>
                ))}
              </SearchResultsList>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ======================================================== */}
        {/* 노선 구간 직접 수정 모달 */}
        {/* ======================================================== */}
        {editModalOpen && (
          <ModalOverlay onClick={() => setEditModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Edit2 size={18} /> 노선 팁 및 구간 정보 수정
                </ModalTitle>
                <CloseButton onClick={() => setEditModalOpen(false)}>
                  <X size={18} />
                </CloseButton>
              </ModalHeader>

              <form onSubmit={handleEditSubmit}>
                <FormGroup>
                  <Label>구간명 (별칭)</Label>
                  <Input
                    type="text"
                    value={editForm.sectionName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        sectionName: e.target.value,
                      }))
                    }
                    placeholder="예: 인입런 - 8번"
                    required
                  />
                </FormGroup>

                <FormGrid style={{ marginTop: "12px" }}>
                  <FormGroup>
                    <Label>카테고리</Label>
                    <Select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value="go-school">학교 갈래요</option>
                      <option value="go-home">집 갈래요</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>탭명</Label>
                    <Input
                      type="text"
                      value={editForm.tabName}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          tabName: e.target.value,
                        }))
                      }
                      placeholder="예: 인입런"
                    />
                  </FormGroup>
                </FormGrid>

                <FormGroup style={{ marginTop: "12px" }}>
                  <Label>운행시간 및 배차간격 안내 (busNotice)</Label>
                  <TextArea
                    rows={2}
                    value={editForm.busNotice}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        busNotice: e.target.value,
                      }))
                    }
                    placeholder="예: 운행시간 | 05:54 ~ 00:31&#10;배차간격 | 5 ~ 13분"
                  />
                </FormGroup>

                <FormGroup style={{ marginTop: "12px" }}>
                  <Label>💡 한 줄 팁 또는 주의 코멘트 (routeNotice)</Label>
                  <TextArea
                    rows={3}
                    value={editForm.routeNotice}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        routeNotice: e.target.value,
                      }))
                    }
                    placeholder="예: 많이 돌아가는 노선이니 주의하세요! 또는 공대생은 자연대에서 하차하는 것이 빠릅니다."
                  />
                </FormGroup>

                <ModalFooter>
                  <CancelButton
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                  >
                    취소
                  </CancelButton>
                  <SubmitButton type="submit" disabled={loading}>
                    <Check size={16} /> 수정 완료
                  </SubmitButton>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </AdminLayout>
  );
}

// Styled Components
const Container = styled.div`
  padding: 16px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SuccessBanner = styled.div`
  background-color: #ecfdf5;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #a7f3d0;
`;

const TabHeader = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
  overflow-x: auto;
`;

const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: ${({ active }) => (active ? "#2563eb" : "#f3f4f6")};
  color: ${({ active }) => (active ? "#ffffff" : "#4b5563")};
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: ${({ active }) => (active ? "#1d4ed8" : "#e5e7eb")};
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  background-color: #fafafa;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const CardDesc = styled.p`
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const SyncButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const StopSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 16px 0;
`;

const StopSelectBox = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BoxHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const BoxLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
`;

const SubLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #4b5563;
`;

const ManualInputGrid = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const ChipLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
`;

const ChipButton = styled.button<{ isSelected?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.isSelected ? "#2563eb" : "#e5e7eb")};
  background-color: ${(props) => (props.isSelected ? "#eff6ff" : "#ffffff")};
  color: ${(props) => (props.isSelected ? "#1d4ed8" : "#374151")};
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: #2563eb;
    background-color: #eff6ff;
    color: #1d4ed8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CancelMiniButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #fecaca;
  }
`;

const CancelButton = styled.button`
  padding: 12px 18px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background-color: #e5e7eb;
  }
`;

const RuleActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EditRuleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #dbeafe;
  }
`;


const SearchTriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  background-color: #ffffff;
  border: 1px solid #2563eb;
  color: #2563eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #eff6ff;
  }
`;


const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  background-color: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  &:hover:not(:disabled) {
    background-color: #15803d;
  }
  &:disabled {
    background-color: #86efac;
  }
`;

const RuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RuleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const RuleContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const RulePath = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const PathStop = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SmallId = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const AliasTag = styled.span`
  background-color: #ede9fe;
  color: #6d28d9;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const Badge = styled.span<{ isSchool: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: ${({ isSchool }) => (isSchool ? "#dbeafe" : "#fee2e2")};
  color: ${({ isSchool }) => (isSchool ? "#1e40af" : "#991b1b")};
`;

const TabBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: #f3f4f6;
  color: #374151;
`;

const RouteNoBadge = styled.span`
  background-color: #2563eb;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  &:hover {
    background-color: #fee2e2;
  }
`;

const EmptyText = styled.p`
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  margin: 20px 0;
`;

const RouteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const RouteCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const RouteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTitleText = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const RoutePathText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4b5563;
`;

const StopCountBadge = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const NoticeBox = styled.div`
  background-color: #f3f4f6;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 11px;
  color: #4b5563;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  white-space: pre-line;
`;

const TipBox = styled.div`
  background-color: #fef3c7;
  color: #92400e;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
`;

const NoTipText = styled.div`
  font-size: 11px;
  color: #9ca3af;
  font-style: italic;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #dbeafe;
  }
`;

const AliasTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const SearchSubmitBtn = styled.button`
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

const SearchResultsList = styled.div`
  overflow-y: auto;
  max-height: 350px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SearchGuideText = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 30px 0;
`;

const SearchResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #eff6ff;
    border-color: #93c5fd;
  }
`;

const ResultItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ResultStopName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const ResultStopMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ResultItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SelectStopBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

