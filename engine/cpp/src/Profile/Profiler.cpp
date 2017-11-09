//
// Created by jasonm on 06/11/2017.
//

#include "Profiler.hpp"

void Profiler::record(const char *name, std::chrono::duration<double> duration) {
	auto it = stats.find(name);
	double seconds = duration.count();
	if (it == stats.end()) {
		stats.insert(std::make_pair(name, ProfilerStats{ seconds, seconds, seconds, 1 }));
	} else {
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
