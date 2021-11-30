const xpath = require("xpath"),
  dom = require("@xmldom/xmldom").DOMParser;

const { default: axios } = require("axios");
const xmldom = require("@xmldom/xmldom");
const { promisify } = require("util");
const { writeFile } = require("fs");

const main = async function () {
  const response = await axios.get(
    "https://github.com/KhronosGroup/OpenGL-Registry/raw/main/xml/gl.xml"
  );

  const doc = new dom().parseFromString(response.data);

  /**
   * @type {ReadonlyArray<Element>}
   */
  const features = xpath.select("registry/feature", doc).filter((x) => {
    /**
     * @type {string}
     */
    const api = x.getAttribute("api");
    /**
     * @type {string}
     */
    const n = x.getAttribute("number");
    return api === "gles2" && /(?:2\.[0-9])|(?:3\.0)/.test(n);
  });

  /**
   * @type {Record<string, Element>}
   */
  const commands = xpath
    .select("registry/commands/command", doc)
    .reduce((total, x) => {
      const name = xpath.select1("proto/name", x).textContent;
      total[name] = x;
      return total;
    }, {});
  /**
   * @type {Record<string, Element>}
   */
  const enums = xpath.select("registry/enums/enum", doc).reduce((total, x) => {
    const name = x.getAttribute("name");
    total[name] = x;
    return total;
  }, {});
  /**
   * @type {Record<string, Element>}
   */
  const types = xpath.select("registry/types/type", doc).reduce((total, x) => {
    const name = xpath.select1("name", x);
    if (name != null) {
      total[name.textContent] = x;
    }
    return total;
  }, {});
  /**
   * @type {Element[]}
   */
  let require_commands = [];
  /**
   * @type {Element[]}
   */
  let require_enums = [];
  /**
   * @type {Element[]}
   */
  let require_types = [];

  /**
   * @type {Element[]}
   */
  let remove_commands = [];
  /**
   * @type {Element[]}
   */
  let remove_enums = [];
  /**
   * @type {Element[]}
   */
  let remove_types = [];

  /**
   * @type {ReadonlyArray<string>}
   */
  const except_for_emscripten = [
    "glFlushMappedBufferRange",
    "glGetBufferPointerv",
    "glMapBufferRange",
    "glUnmapBuffer",
  ];

  for (const feature of features) {
    const requires = Array.from(feature.getElementsByTagName("require"));
    const removes = Array.from(feature.getElementsByTagName("removes"));

    for (const require of requires) {
      require_commands.push(
        ...Array.from(require.getElementsByTagName("command"))
      );
      require_enums.push(...Array.from(require.getElementsByTagName("enum")));
      require_types.push(...Array.from(require.getElementsByTagName("type")));
    }

    for (const remove of removes) {
      remove_commands.push(
        ...Array.from(remove.getElementsByTagName("command"))
      );
      remove_enums.push(...Array.from(remove.getElementsByTagName("enum")));
      remove_types.push(...Array.from(remove.getElementsByTagName("type")));
    }
  }

  require_commands = require_commands.filter((x) => {
    const name = xpath.select1(
      "proto/name",
      commands[x.getAttribute("name")]
    ).textContent;
    return !remove_commands.find((x) => {
      x.getAttribute("name") === name;
    });
  });

  require_enums = require_enums.filter((x) => {
    const name = enums[x.getAttribute("name")].getAttribute("name");
    return !remove_enums.find((x) => {
      x.getAttribute("name") === name;
    });
  });

  /**
   * @type {string[]}
   */
  const lua_function_implementations = [];
  /**
   * @type {string[]}
   */
  const lua_set_function_fields = [];
  /**
   * @type {string[]}
   */
  const export_functions = [];

  /**
   * @type {string[]}
   */
  const cpp_enums = [];

  /**
   * @type {string[]}
   */
  const lua_enums = [];

  const _require_enums = require_enums.map((require_enum) => {
    const em = enums[xpath.select1("@name", require_enum).nodeValue];
    /**
     * @type {string}
     */
    const name = xpath.select1("@name", em).nodeValue;
    /**
     * @type {string}
     */
    const value = xpath.select1("@value", em).nodeValue;

    const lua_name = name.substr(3);

    return {
      name,
      lua_name,
      value,
    };
  });

  const _require_commands = require_commands.map((require_command) => {
    const command = commands[xpath.select1("@name", require_command).nodeValue];
    /**
     * @type {Element}
     */
    const proto = xpath.select1("proto", command);
    /**
     * @type {string}
     */
    const name = xpath.select1("name", proto).textContent;
    /**
     * @type {string}
     */
    const group = xpath.select1("@group", proto)?.nodeValue || null;
    /**
     * @type {ReadonlyArray<Element>}
     */
    const params = Array.from(xpath.select("param", command));

    const method_name = name.substr(2, 1).toLowerCase() + name.substr(3);

    const return_type = xpath.select1("ptype", proto)?.textContent ?? "void";

    const num_return_ptr = proto.textContent.match(/\*/g)?.length || 0;
    const num_return_const =
      ` ${proto.textContent} `.match(/[\s\*]const[\*\s]/g)?.length || 0;

    return {
      name,
      method_name,
      group,
      params: params.map((x) => {
        const name = xpath.select1("name", x)?.textContent;
        const num_ptr = x.textContent.match(/\*/g)?.length || 0;
        const num_const =
          ` ${x.textContent} `.match(/[\s\*]const[\*\s]/g)?.length || 0;
        const text = Array.from(x.childNodes)
          .map((x) => x.textContent.trim())
          .filter((x) => x)
          .join(" ");
        let ptype = xpath.select1("ptype", x)?.textContent ?? "void";
        return {
          name,
          text,
          num_ptr,
          num_const,
          ptype,
        };
      }),
      return_type,
      num_return_ptr,
      num_return_const,
    };
  });

  for (const { lua_name, value } of _require_enums) {
    cpp_enums.push(`    lua_pushinteger(L, ${value});
    lua_setfield(L, -2, "${lua_name}");`);
    lua_enums.push(`    export const ${lua_name}: ${value}`);
  }

  for (const require_command of require_commands) {
    const command = commands[xpath.select1("@name", require_command).nodeValue];
    /**
     * @type {Element}
     */
    const proto = xpath.select1("proto", command);
    /**
     * @type {string}
     */
    const name = xpath.select1("name", proto).textContent;
    /**
     * @type {string}
     */
    const group = xpath.select1("@group", proto)?.nodeValue || null;
    /**
     * @type {ReadonlyArray<Element>}
     */
    const params = Array.from(xpath.select("param", command));

    const ptype = xpath.select1("ptype", proto)?.textContent;

    /**
     * @type {string}
     */
    const param_texts = params
      .reduce((total, param, i) => {
        const idx = i + 1;
        /**
         * @type {string}
         */
        let right = null;
        let left = null;
        let last = "";

        const num_ptr = param.textContent.match(/\*/g)?.length || 0;
        const num_const =
          ` ${param.textContent} `.match(/[\s\*]const[\*\s]/g)?.length || 0;

        /**
         * @type {string}
         */
        let ptype = xpath.select1("ptype", param)?.textContent || null;
        if (num_ptr > 0) {
          let cast_type = ptype;
          if (!cast_type) {
            cast_type = "void";
          }
          const cast_type_ptr = "*".repeat(num_ptr);
          const cast = `(${cast_type} ${cast_type_ptr})`;
          switch (cast_type) {
            case "GLchar": {
              if (num_const == 1) {
                right = `${cast}luaL_checkstring(L, ${idx})`;
                left = Array.from(param.childNodes)
                  .map((x) => x.textContent.trim())
                  .filter((x) => x)
                  .join(" ");
              } else {
                const name = xpath.select1("name", param).textContent;
                right = `(Buffer *)luaL_checkudata(L, ${idx}, "LUA_USERDATA_TYPE_BUFFER")`;
                left = `Buffer *${name}_`;
                last = `
    ${Array.from(param.childNodes)
      .map((x) => x.textContent.trim())
      .filter((x) => x)
      .join(" ")} = ${cast}${name}_->p;`;
              }
              break;
            }
            default: {
              const name = xpath.select1("name", param).textContent;
              right = `(Buffer *)luaL_checkudata(L, ${idx}, "LUA_USERDATA_TYPE_BUFFER")`;
              left = `Buffer *${name}_`;
              last = `
    ${Array.from(param.childNodes)
      .map((x) => x.textContent.trim())
      .filter((x) => x)
      .join(" ")} = ${cast}${name}_->p;`;
              break;
            }
          }
        } else {
          switch (ptype) {
            case "GLbitfield":
            case "GLenum":
            case "GLint":
            case "GLuint":
            case "GLuint64":
            case "GLsizeiptr":
            case "GLsizei": {
              right = `luaL_checkinteger(L, ${idx})`;
              left = Array.from(param.childNodes)
                .map((x) => x.textContent.trim())
                .filter((x) => x)
                .join(" ");
              break;
            }
            case "GLfloat": {
              right = `luaL_checknumber(L, ${idx})`;
              left = Array.from(param.childNodes)
                .map((x) => x.textContent.trim())
                .filter((x) => x)
                .join(" ");
              break;
            }
            case "GLboolean": {
              right = `lua_toboolean(L, ${idx})`;
              left = Array.from(param.childNodes)
                .map((x) => x.textContent.trim())
                .filter((x) => x)
                .join(" ");
              break;
            }
            case "GLchar": {
              right = `luaL_checkstring(L, ${idx})`;
              left = Array.from(param.childNodes)
                .map((x) => x.textContent.trim())
                .filter((x) => x)
                .join(" ");
              break;
            }
            case "GLintptr": {
              const name = xpath.select1("name", param).textContent;
              right = `(Buffer *)luaL_checkudata(L, ${idx}, "LUA_USERDATA_TYPE_BUFFER")`;
              left = `Buffer *${name}_`;
              last = `
    ${Array.from(param.childNodes)
      .map((x) => x.textContent.trim())
      .filter((x) => x)
      .join(" ")} = (${ptype})${name}_->p;`;
              break;
            }
            case "GLsync":
            default: {
              right = `(${ptype})luaL_error(L, "#${idx}: unsupported type")`;
              left = Array.from(param.childNodes)
                .map((x) => x.textContent.trim())
                .filter((x) => x)
                .join(" ");
              break;
            }
          }
        }

        total.push(`    ${left} = ${right};${last}`);
        return total;
      }, [])
      .join("\n");

    const num_return_ptr = proto.textContent.match(/\*/g)?.length || 0;
    const return_type = `const ${ptype ? ptype : "void"} ${"*".repeat(
      num_return_ptr
    )}`.trim();

    const return_left_text =
      num_return_ptr > 0
        ? `    ${return_type} ret = `
        : ptype
        ? `    ${ptype} ret = `
        : "    ";
    const method_name = name.substr(2, 1).toLowerCase() + name.substr(3);

    const function_call = `${return_left_text}${name}(${params
      .map((x) => xpath.select1("name", x).textContent)
      .join(", ")});`;

    const lua_function_body = `${param_texts}
${function_call}
${
  return_type === "const GLubyte *"
    ? `${
        group === "String"
          ? `    lua_pushstring(L, (const char *)ret);
    return 1;`
          : `    return 0`
      }`
    : return_type === "const GLboolean"
    ? `    lua_pushboolean(L, ret);
    return 1;`
    : return_type === "const GLuint"
    ? `    lua_pushinteger(L, ret);
    return 1;`
    : return_type === "const GLint"
    ? `    lua_pushinteger(L, ret);;
    return 1;`
    : return_type === "const GLenum"
    ? `    lua_pushinteger(L, ret);;
    return 1;`
    : "    return 0;"
}`;
    const lua_function = `int L_${method_name}(lua_State *L) {
${
  except_for_emscripten.find((x) => x === name)
    ? `#ifdef __EMSCRIPTEN__
    luaL_error(L, "This function is not support.");
    return 0;
#else
${lua_function_body}
#endif`
    : `${lua_function_body}`
}
}`;
    lua_function_implementations.push(lua_function);

    const lua_set_function_field = `    lua_pushcfunction(L, L_${method_name});
    lua_setfield(L, -2, "${method_name}");`;
    lua_set_function_fields.push(lua_set_function_field);

    let lua_return_type;
    switch (return_type) {
      case "const GLubyte *": {
        lua_return_type = group === "String" ? `string` : `void`;
      }
      case "const GLfloat":
      case "const GLuint":
      case "const GLenum":
      case "const GLint": {
        lua_return_type = "number";
        break;
      }
      case "const GLboolean": {
        lua_return_type = "boolean";
        break;
      }
      case "const void": {
        lua_return_type = "void";
        break;
      }
      default: {
        lua_return_type = "void";
        break;
      }
    }

    const export_function = `    export function ${method_name}(${params
      .map((x) => {
        const name = xpath.select1("name", x).textContent;
        const num_ptr = x.textContent.match(/\*/g)?.length || 0;
        /**
         * @type {string}
         */
        let ptype = xpath.select1("ptype", x)?.textContent || null;
        if (num_ptr > 0) {
          return `${name}: {__native_buffer: never}`;
        } else {
          switch (ptype) {
            case "GLenum":
            case "GLbitfield":
            case "GLuint":
            case "GLsizei":
            case "GLfloat":
            case "GLuint64":
            case "GLint": {
              return `${name}: number`;
            }
            case "GLboolean": {
              return `${name}: boolean`;
            }
            case "GLchar": {
              return `${name}: string`;
            }
            case "GLsync": {
              return `${name}: never`;
            }
            case "GLsizeiptr": {
              return `${name}: number`;
            }
            case "GLintptr": {
              return `${name}: ArrayBuffer`;
            }
            default: {
              return `${name}: never`;
            }
          }
        }
      })
      .join(", ")}): ${lua_return_type};`;
    export_functions.push(export_function);
  }

  const cpp_code = `// auto generated
#include "lua_gl_bindings.hpp"
#include "gl_common.hpp"
#include "lua_utils.hpp"

#include "lua_native_buffer_impl.hpp"

namespace {
${lua_function_implementations.join("\n")}
int L_require(lua_State *L) {
    lua_newtable(L);
${cpp_enums.join("\n")}
${lua_set_function_fields.join("\n")}
    return 1;
}
}

void lua_open_gl_libs(lua_State *L) {
  luaL_requiref(L, "gl", L_require, false);
}
`;

  const hpp_code = `// auto generated
#ifndef __LUA_GL_BINDINGS_HPP__
#define __LUA_GL_BINDINGS_HPP__

#include "lua_common.hpp"

void lua_open_gl_libs(lua_State *L);

#endif
`;

  const dts_code = `/** @noSelfInFile */
/** @noResolution */
declare module "gl" {
${lua_enums.join("\n")}
${export_functions.join("\n")}
}
  `;
  await Promise.all([
    promisify(writeFile)("./src/lua_gl_bindings.cpp", cpp_code),
    promisify(writeFile)("./src/lua_gl_bindings.hpp", hpp_code),
    promisify(writeFile)(
      "./scripts/luna-base/types/gl_bindings.d.ts",
      dts_code
    ),
  ]);
};

main();
