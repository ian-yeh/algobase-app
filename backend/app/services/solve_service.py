class SolveService:
    def __init__(self):
        pass

    def calculate_best_ao5(self, times: list[int]) -> float:
        return self._calculate_best_average(times, 5)

    def calculate_best_ao12(self, times: list[int]) -> float:
        return self._calculate_best_average(times, 12)

    def calculate_best_ao100(self, times: list[int]) -> float:
        return self._calculate_best_average(times, 100)

    def get_best_time(self, times: list[int]) -> int:
        if not times:
            return 0
        return min(times)

    def _calculate_best_average(self, times: list[int], window: int) -> float:
        """
        Calculates the best rolling average for a given window size (Ao5, Ao12, etc.)
        according to WCA rules.
        """
        if len(times) < window:
            return 0

        best_average = float("inf")
        for i in range(len(times) - window + 1):
            subset = times[i:i + window]
            avg = self._compute_wca_average(subset)
            best_average = min(best_average, avg)

        return round(best_average, 2) if best_average != float("inf") else 0

    def _compute_wca_average(self, subset: list[int]) -> float:
        """
        Removes the fastest and slowest solves (for Ao5) or 5% each side for larger sets.
        """
        n = len(subset)
        if n < 3:
            return 0  # can't compute average if not enough times

        sorted_times = sorted(subset)
        # WCA rules: remove floor(n * 0.05) best and worst times
        to_remove = max(1, int(n * 0.05)) if n > 5 else 1
        trimmed = sorted_times[to_remove:-to_remove]
        return sum(trimmed) / len(trimmed)
