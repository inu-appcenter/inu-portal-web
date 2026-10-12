import { useEffect, useState } from "react";
import { getUpcomingLmsAssignments, type LmsAssignmentEvent } from "@/apis/lms";
import { getWeathers } from "@/apis/weathers";
import type { WeatherInfo } from "@/types/weathers";

let weatherCache: WeatherInfo | null = null;
let weatherRequest: Promise<WeatherInfo | null> | null = null;
let assignmentsCache: LmsAssignmentEvent[] | null = null;
let assignmentsRequest: Promise<LmsAssignmentEvent[]> | null = null;

const loadWeather = () => {
  if (weatherCache) return Promise.resolve(weatherCache);
  if (!weatherRequest) {
    weatherRequest = getWeathers()
      .then((response) => {
        weatherCache = response.data ?? null;
        return weatherCache;
      })
      .catch(() => null)
      .finally(() => {
        weatherRequest = null;
      });
  }
  return weatherRequest;
};

const loadAssignments = () => {
  if (assignmentsCache) return Promise.resolve(assignmentsCache);
  if (!assignmentsRequest) {
    assignmentsRequest = getUpcomingLmsAssignments(7)
      .then((assignments) => {
        assignmentsCache = assignments;
        return assignments;
      })
      .catch(() => [])
      .finally(() => {
        assignmentsRequest = null;
      });
  }
  return assignmentsRequest;
};

export function useDailyBriefWeather() {
  const [weather, setWeather] = useState<WeatherInfo | null>(weatherCache);
  const [isLoading, setIsLoading] = useState(weatherCache === null);

  useEffect(() => {
    let mounted = true;
    void loadWeather().then((data) => {
      if (mounted) {
        setWeather(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { weather, isLoading };
}

export function useDailyBriefAssignments() {
  const [assignments, setAssignments] = useState<LmsAssignmentEvent[]>(
    assignmentsCache ?? [],
  );
  const [isLoading, setIsLoading] = useState(assignmentsCache === null);

  useEffect(() => {
    let mounted = true;
    void loadAssignments().then((data) => {
      if (mounted) {
        setAssignments(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { assignments, isLoading };
}
