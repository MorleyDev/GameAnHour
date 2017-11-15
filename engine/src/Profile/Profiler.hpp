#ifndef DUKSFML_PROFILER_HPP
#define DUKSFML_PROFILER_HPP

#include <chrono>
#include <unordered_map>
#include <ostream>
#include <string>

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
	std::chrono::system_clock::time_point startTime;
	std::string name;

public:
	explicit Profiler(std::string name);

	template<typename TCallback> void profile(const char* name, TCallback callback) {
		auto profileStartTime = std::chrono::system_clock::now();
		callback();
		record(name, std::chrono::system_clock::now() - profileStartTime);
	}

	void record(const char* name, std::chrono::duration<double> duration);
	Profile profile(const char* name);

	inline std::unordered_map<const char*, ProfilerStats> statdump() { return stats; };
	void iodump(std::ostream& output);

	std::chrono::duration<double> getProfiledTimed();
	std::chrono::duration<double> getCurrentRunTime();

	std::string getName() const { return name; }
};

inline Profile::~Profile() {
	if (profiler) {
		profiler->record(name, std::chrono::system_clock::now() - startTime);
	}
}

#endif //DUKSFML_PROFILER_HPP
