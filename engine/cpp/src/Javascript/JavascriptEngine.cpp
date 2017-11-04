#include "JavascriptEngine.hpp"
#include "../../duk_console.h"

#include <fstream>

std::vector<std::function<duk_ret_t (duk_context*)>> JavascriptEngine::globalFunctions;

duk_ret_t globalNativeFunction(duk_context *ctx) {
    auto magic = duk_get_current_magic(ctx);
    return JavascriptEngine::globalFunctions[magic](ctx);
}

JavascriptEngine::JavascriptEngine()
        : context(duk_create_heap_default()) {
    duk_console_init(context, 0);
    add(
            "global",
            "if (typeof global === 'undefined') {"
            "    (function () {"
            "        var global = new Function('return this;')();"
            "        Object.defineProperty(global, 'global', {"
            "            value: global,"
            "            writable: true,"
            "            enumerable: false,"
            "            configurable: true"
            "        });"
            "    })();"
            "}"
    );
}

JavascriptEngine::~JavascriptEngine() {
    duk_destroy_heap(context);
}

void JavascriptEngine::add(std::string name, std::string script)
{
    push(script);
    if (duk_peval(context) != 0)
        throw std::runtime_error(std::string(name) + ":" + duk_safe_to_string(context, -1));
    pop();
}

void JavascriptEngine::load(std::string filepath) {
    std::ifstream engineCode(filepath);
    if (!engineCode.is_open()) {
        throw std::runtime_error(std::string("File not found: ") + filepath);
    }

    auto script = std::string((std::istreambuf_iterator<char>(engineCode)), std::istreambuf_iterator<char>());
    add(filepath, script);
}

void JavascriptEngine::setGlobalFunction(std::string name, std::function<duk_ret_t (duk_context*)> function, int nargs)
{
    globalFunctions.push_back(function);
    auto index = globalFunctions.size() - 1;

    duk_push_global_object(context);
    duk_push_c_function(context, globalNativeFunction, nargs);
    duk_set_magic(context, -1, static_cast<duk_idx_t>(index));
    duk_put_prop_string(context, -2, name.c_str());
    duk_pop(context);
}

void JavascriptEngine::getPropString(int index, std::string name) {
    duk_get_prop_string(context, index, name.c_str());
}

void JavascriptEngine::call(std::size_t nargs) {
    if (duk_pcall(context, static_cast<duk_idx_t>(nargs)) != 0) {
        auto result = std::string(duk_safe_to_string(context, -1));
        pop();
        throw std::runtime_error(result);
    }
}

void JavascriptEngine::pushGlobal() {
    duk_push_global_object(context);
}

void JavascriptEngine::push() {}

void JavascriptEngine::push(const char *value) {
    duk_push_string(context, value);
}

void JavascriptEngine::push(std::string value) {
    duk_push_string(context, value.c_str());
}

void JavascriptEngine::push(double value) {
    duk_push_number(context, value);
}

void JavascriptEngine::push(int value) {
    duk_push_number(context, value);
}
void JavascriptEngine::push(unsigned int value) {
    duk_push_number(context, value);
}

void JavascriptEngine::push(bool value) {
    duk_push_boolean(context, value ? 1 : 0);
}

void JavascriptEngine::pop() {
    duk_pop(context);
}


/*
 *  Minimal 'console' binding.
 *
 *  https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
 *  https://developers.google.com/web/tools/chrome-devtools/debug/console/console-reference
 *  https://developer.mozilla.org/en/docs/Web/API/console
 */

/* XXX: Add some form of log level filtering. */

/* XXX: For now logs everything to stdout, V8/Node.js logs debug/info level
 * to stdout, warn and above to stderr.  Should this extra do the same?
 */

/* XXX: Should all output be written via e.g. console.write(formattedMsg)?
 * This would make it easier for user code to redirect all console output
 * to a custom backend.
 */

/* XXX: Init console object using duk_def_prop() when that call is available. */

static duk_ret_t duk__console_log_helper(duk_context *ctx, const char *error_name) {
    duk_idx_t i, n;
    duk_uint_t flags;

    flags = (duk_uint_t) duk_get_current_magic(ctx);

    n = duk_get_top(ctx);

    duk_get_global_string(ctx, "console");
    duk_get_prop_string(ctx, -1, "format");

    for (i = 0; i < n; i++) {
        if (duk_check_type_mask(ctx, i, DUK_TYPE_MASK_OBJECT)) {
            /* Slow path formatting. */
            duk_dup(ctx, -1);  /* console.format */
            duk_dup(ctx, i);
            duk_call(ctx, 1);
            duk_replace(ctx, i);  /* arg[i] = console.format(arg[i]); */
        }
    }

    duk_pop_2(ctx);

    duk_push_string(ctx, " ");
    duk_insert(ctx, 0);
    duk_join(ctx, n);

    if (error_name) {
        duk_push_error_object(ctx, DUK_ERR_ERROR, "%s", duk_require_string(ctx, -1));
        duk_push_string(ctx, "name");
        duk_push_string(ctx, error_name);
        duk_def_prop(ctx, -3, DUK_DEFPROP_FORCE | DUK_DEFPROP_HAVE_VALUE);  /* to get e.g. 'Trace: 1 2 3' */
        duk_get_prop_string(ctx, -1, "stack");
    }

    fprintf(stdout, "%s\n", duk_to_string(ctx, -1));
    if (flags & DUK_CONSOLE_FLUSH) {
        fflush(stdout);
    }
    return 0;
}

static duk_ret_t duk__console_assert(duk_context *ctx) {
    if (duk_to_boolean(ctx, 0)) {
        return 0;
    }
    duk_remove(ctx, 0);

    return duk__console_log_helper(ctx, "AssertionError");
}

static duk_ret_t duk__console_log(duk_context *ctx) {
    return duk__console_log_helper(ctx, nullptr);
}

static duk_ret_t duk__console_trace(duk_context *ctx) {
    return duk__console_log_helper(ctx, "Trace");
}

static duk_ret_t duk__console_info(duk_context *ctx) {
    return duk__console_log_helper(ctx, nullptr);
}

static duk_ret_t duk__console_warn(duk_context *ctx) {
    return duk__console_log_helper(ctx, nullptr);
}

static duk_ret_t duk__console_error(duk_context *ctx) {
    return duk__console_log_helper(ctx, "Error");
}

static duk_ret_t duk__console_dir(duk_context *ctx) {
    /* For now, just share the formatting of .log() */
    return duk__console_log_helper(ctx, nullptr);
}

static void duk__console_reg_vararg_func(duk_context *ctx, duk_c_function func, const char *name, duk_uint_t flags) {
    duk_push_c_function(ctx, func, DUK_VARARGS);
    duk_push_string(ctx, "name");
    duk_push_string(ctx, name);
    duk_def_prop(ctx, -3, DUK_DEFPROP_HAVE_VALUE | DUK_DEFPROP_FORCE);  /* Improve stacktraces by displaying function name */
    duk_set_magic(ctx, -1, (duk_int_t) flags);
    duk_put_prop_string(ctx, -2, name);
}

void duk_console_init(duk_context *ctx, duk_uint_t flags) {
    duk_push_object(ctx);

    /* Custom function to format objects; user can replace.
     * For now, try JX-formatting and if that fails, fall back
     * to ToString(v).
     */
    duk_eval_string(ctx,
                    "(function (E) {"
                            "return function format(v){"
                            "try{"
                            "return E('jx',v);"
                            "}catch(e){"
                            "return String(v);"  /* String() allows symbols, ToString() internal algorithm doesn't. */
                            "}"
                            "};"
                            "})(Duktape.enc)");
    duk_put_prop_string(ctx, -2, "format");

    duk__console_reg_vararg_func(ctx, duk__console_assert, "assert", flags);
    duk__console_reg_vararg_func(ctx, duk__console_log, "log", flags);
    duk__console_reg_vararg_func(ctx, duk__console_log, "debug", flags);  /* alias to console.log */
    duk__console_reg_vararg_func(ctx, duk__console_trace, "trace", flags);
    duk__console_reg_vararg_func(ctx, duk__console_info, "info", flags);
    duk__console_reg_vararg_func(ctx, duk__console_warn, "warn", flags);
    duk__console_reg_vararg_func(ctx, duk__console_error, "error", flags);
    duk__console_reg_vararg_func(ctx, duk__console_error, "exception", flags);  /* alias to console.error */
    duk__console_reg_vararg_func(ctx, duk__console_dir, "dir", flags);

    duk_put_global_string(ctx, "console");

    /* Proxy wrapping: ensures any undefined console method calls are
     * ignored silently.  This is required specifically by the
     * DeveloperToolsWG proposal (and is implemented also by Firefox:
     * https://bugzilla.mozilla.org/show_bug.cgi?id=629607).
     */

    if (flags & DUK_CONSOLE_PROXY_WRAPPER) {
        /* Tolerate errors: Proxy may be disabled. */
        duk_peval_string_noresult(ctx,
                                  "(function(){"
                                          "var D=function(){};"
                                          "console=new Proxy(console,{"
                                          "get:function(t,k){"
                                          "var v=t[k];"
                                          "return typeof v==='function'?v:D;"
                                          "}"
                                          "});"
                                          "})();"
        );
    }
}
