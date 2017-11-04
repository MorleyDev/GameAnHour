#include "TimerExtensions.hpp"

const char* timeoutScript =
    "(function () {"
    "    var activeTimeouts = [];"
    "    var nextTimeoutId = 0;"
    "    var scheduledTimeouts = [];"
    "    setImmediate = function (callback) {"
    "        var args = [].concat([], arguments).slice(2);"
    "        activeTimeouts.push({ id: nextTimeoutId, args: args, callback: callback, timeUntil: 0});"
    "        return nextTimeoutId++;"
    "    };"
    "    setTimeout = function (callback, milliseconds) {"
    "        var args = [].concat([], arguments).slice(2);"
    "        activeTimeouts.push({ id: nextTimeoutId, args: args, callback: callback, timeUntil: milliseconds });"
    "        return nextTimeoutId++;"
    "    };"
    "    clearTimeout = function (id) {"
    "        activeTimeouts = activeTimeouts.filter(function (e) { return e.id !== id; });"
    "        scheduledTimeouts = scheduledTimeouts.filter(function (e) { return e.id !== id; });"
    "    };"
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
    "    flushTimeouts = function () {"
    "        while (scheduledTimeouts.length !== 0) {"
    "            var timeout = scheduledTimeouts.shift();"
    "            timeout.callback.apply(null, timeout.args);"
    "        }"
    "    };"
    "})();";

const char* intervalsScript =
    "(function () {"
    "    var activeIntervals = [];"
    "    var nextIntervalId = 0;"
    "    var scheduledIntervals = [];"
    "    setInterval = function (callback, milliseconds) {"
    "        var args = [].concat([], arguments).slice(2);"
    "        activeIntervals.push({ id: nextIntervalId, args: args, callback: callback, timeUntil: milliseconds, runEvery: milliseconds });"
    "        return nextIntervalId++;"
    "    };"
    "    clearInterval = function (id) {"
    "        activeIntervals = activeIntervals.filter(function (e) { return e.id !== id; });"
    "        scheduledIntervals = scheduledIntervals.filter(function (e) { return e.id !== id; });"
    "    };"
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
    "    flushIntervals = function () {"
    "        while (scheduledIntervals.length !== 0) {"
    "            var interval = scheduledIntervals.shift();"
    "            interval.callback.apply(null, interval.args);"
    "        }"
    "    };"
    "})();";

const char* animationFrameScript =
    "(function () {"
    "    var activeAnimationFrames = [];"
    "    var nextAnimationFrameId = 0;"
    "    requestAnimationFrame = function (callback) {"
    "        var args = [].concat([], arguments).slice(1);"
    "        activeAnimationFrames.push({ id: nextAnimationFrameId, args: args, callback: callback });"
    "        return nextAnimationFrameId++;"
    "    };"
    "    cancelAnimationFrame = function (id) {"
    "        activeAnimationFrames = activeAnimationFrames.filter(function (e) { return e.id !== id; });"
    "    };"
    "    flushAnimationFrames = function () {"
    "        while (activeAnimationFrames.length !== 0) {"
    "            var animationFrame = activeAnimationFrames.shift();"
    "            animationFrame.callback.apply(null, animationFrame.args);"
    "        }"
    "    };"
    "})();";

void attachTimers(JavascriptEngine &engine) {
    engine.add("timeout", timeoutScript);
    engine.add("interval", intervalsScript);
    engine.add("animationFrame", animationFrameScript);
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
