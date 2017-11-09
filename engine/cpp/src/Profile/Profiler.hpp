//
// Created by jasonm on 06/11/2017.
//

#ifndef DUKSFML_PROFILER_HPP
#define DUKSFML_PROFILER_HPP

#include <chrono>
#include <unordered_map>

struct ProfilerStats {
	double total;
	double min;
	double max;
	std::uint_fast64_t count;
};

class Profiler;
struct Profile {
	const char* name;
	Profiler* profiler;
	std::chrono::system_clock::time_point startTime;
	Profile(Profiler& profiler, const char* name)
		: profiler(&profiler),
		name(name),
		startTime(std::chrono::system_clock::now()) {
	}

	Profile(const Profile&) = delete;
	Profile& operator=(const Profile&) = delete;

	Profile(Profile&& orig)
		: name(orig.name),
		profiler(orig.profiler),
		startTime(orig.startTime) {
		orig.profiler = nullptr;
	}

	~Profile();
};

class Profiler {
private:
	std::unordered_map<const char*, ProfilerStats> stats;
public:
	Profile profile(const char* name);

	template<typename TCallback> void profile(const char* name, TCallback callback) {
		auto startTime = std::chrono::system_clock::now();
		callback();
		record(name, std::chrono::system_clock::now() - startTime);
	}

	void record(const char* name, std::chrono::duration<double> duration);

	std::unordered_map<const char*, ProfilerStats> statdump() { return stats; };
};

inline Profile::~Profile() {
	if (profiler) {
		profiler->record(name, std::chrono::system_clock::now() - startTime);
	}
}

#endif //DUKSFML_PROFILER_HPP
