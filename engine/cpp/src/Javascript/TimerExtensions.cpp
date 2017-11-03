#include "TimerExtensions.hpp"

const char* timeoutScript =
    "(function () {"
    "    var activeTimeouts = [];"
    "    var nextTimeoutId = 0;"
    "    var scheduledTimeouts = [];"
    ""
    "    setTimeout = function (callback, milliseconds) {"
    "        var args = [].concat([], arguments).slice(2);"
    "        activeTimeouts.push({ id: nextTimeoutId, args: args, callback: callback, timeUntil: milliseconds });"
    "        return nextTimeoutId++;"
    "    };"
    ""
    "    clearTimeout = function (id) {"
    "        activeTimeouts = activeTimeouts.filter(function (e) { return e.id !== id; })"
    "    };"
    ""
    "    tickTimeouts = function (milliseconds) {"
    "        milliseconds = milliseconds || 0;"
    "        for (var i = 0; i < activeTimeouts.length;) {"
    "            var timeout = activeTimeouts[i];"
    "            timeout.timeUntil -= milliseconds;"
    "            if (timeout.timeUntil <= 0) {"
    "                scheduledTimeouts.push(timeout);"
    "                activeTimeouts.splice(i, 1);"
    "            } else {"
    "                ++i;"
    "            }"
    "        }"
    "    };"
    ""
    "    flushTimeouts = function () {"
    "        if (scheduledTimeouts.length === 0) {"
    "            return;"
    "        }"
    ""
    "        var timeouts = scheduledTimeouts;"
    "        scheduledTimeouts = [];"
    "        for (var i = 0; i < timeouts.length; ++i) {"
    "            var timeout = timeouts[i];"
    "            timeout.callback.apply(null, timeout.args);"
    "        }"
    "    };"
    "})();";

const char* intervalsScript =
    "(function () {"
    "    var activeIntervals = [];"
    "    var nextIntervalId = 0;"
    "    var scheduledIntervals = [];"
    ""
    "    setInterval = function (callback, milliseconds) {"
    "        var args = [].concat([], arguments).slice(2);"
    "        activeIntervals.push({ id: nextIntervalId, args: args, callback: callback, timeUntil: milliseconds, runEvery: milliseconds });"
    "        return nextIntervalId++;"
    "    };"
    ""
    "    clearInterval = function (id) {"
    "        activeIntervals = activeIntervals.filter(function (e) { return e.id !== id; })"
    "    };"
    ""
    "    tickIntervals = function (milliseconds) {"
    "        milliseconds = milliseconds || 0;"
    "        for (var i = 0; i < activeIntervals.length; ++i) {"
    "            var interval = activeIntervals[i];"
    "            interval.timeUntil -= milliseconds;"
    "            if (interval.timeUntil <= 0) {"
    "                scheduledIntervals.push(interval);"
    "                interval.timeUntil = interval.timeUntil + interval.runEvery"
    "            }"
    "        }"
    "    };"
    ""
    "    flushIntervals = function () {"
    "        if (scheduledIntervals.length === 0) {"
    "            return;"
    "        }"
    ""
    "        var intervals = scheduledIntervals;"
    "        scheduledIntervals = [];"
    "        for (var i = 0; i < intervals.length; ++i) {"
    "            var interval = intervals[i];"
    "            interval.callback.apply(null, interval.args);"
    "        }"
    "    };"
    "})();";

const char* animationFrameScript =
    "(function () {"
    "    var activeAnimationFrames = [];"
    "    var nextAnimationFrameId = 0;"
    ""
    "    requestAnimationFrame = function (callback) {"
    "        var args = [].concat([], arguments).slice(1);"
    "        activeAnimationFrames.push({ id: nextAnimationFrameId, args: args, callback: callback });"
    "        return nextAnimationFrameId++;"
    "    };"
    ""
    "    cancelAnimationFrame = function (id) {"
    "        activeAnimationFrames = activeAnimationFrames.filter(function (e) { return e.id !== id; })"
    "    };"
    ""
    "    flushAnimationFrames = function () {"
    "        if (activeAnimationFrames.length === 0) {"
    "            return;"
    "        }"
    ""
    "        var animationFrames = activeAnimationFrames;"
    "        activeAnimationFrames = [];"
    "        for (var i = 0; i < animationFrames.length; ++i) {"
    "            var animationFrame = animationFrames[i];"
    "            animationFrame.callback.apply(null, animationFrame.args);"
    "        }"
    "    };"
    "})();";

void attachTimers(JavascriptEngine &engine) {
    engine.add(timeoutScript);
    engine.add(intervalsScript);
    engine.add(animationFrameScript);
}

void animate(JavascriptEngine &engine) {
    engine.trigger("flushAnimationFrames");
}

void tick(JavascriptEngine &engine, double ms) {
    engine.trigger("tickTimeouts", ms);
    engine.trigger("tickIntervals", ms);
    engine.trigger("flushTimeouts");
    engine.trigger("flushIntervals");
}
