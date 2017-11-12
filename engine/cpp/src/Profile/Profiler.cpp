//
// Created by jasonm on 06/11/2017.
//

#include "Profiler.hpp"
#include <iostream>

Profiler::Profiler()
	: stats(), startTime(std::chrono::system_clock::now()) {
}

void Profiler::record(const char *name, std::chrono::duration<double> duration) {
	auto it = stats.find(name);
	double seconds = duration.count();
	if (it == stats.end()) {
		stats.insert(std::make_pair(name, ProfilerStats{ seconds, seconds, seconds, 1 }));
	}
	else {
		it->second.total += seconds;
		it->second.count += 1;
		if (it->second.max < seconds) {
			it->second.max = seconds;
		}
		if (it->second.min > seconds) {
			it->second.min = seconds;
		}
	}
}

Profile Profiler::profile(const char *name) {
	return Profile(*this, name);
}

void Profiler::printdump() {
	const auto totalTimeDuration = getCurrentRunTime();
	const auto profiledTimeDuration = getProfiledTimed();

	const auto totalTime = totalTimeDuration.count();
	const auto profiledTime = profiledTimeDuration.count();
	const auto unaccountedTime = std::abs(totalTime - profiledTime);

	for (const auto& stat : stats) {
		auto avg = stat.second.total / stat.second.count;
		auto min = stat.second.min;
		auto max = stat.second.max;
		std::cout << "Engine#" << stat.first << " | " << avg << " | ~" << std::floor((stat.second.total / totalTime) * 100) << "% | (" << min << " - " << max << ") | x" << stat.second.count << std::endl;
	}
	std::cout << "Engine#Unknown" << " | " << unaccountedTime << " | ~" << std::floor((unaccountedTime / totalTime) * 100) << "% | (" << unaccountedTime << " - " << unaccountedTime << ")" << std::endl;
}

std::chrono::duration<double> Profiler::getProfiledTimed() {
	auto profiledTime = 0.0;
	for (auto stat : stats) {
		profiledTime += stat.second.total;
	}
	return std::chrono::duration<double>(profiledTime);
}

std::chrono::duration<double> Profiler::getCurrentRunTime() {
	return std::chrono::system_clock::now() - startTime;
}
