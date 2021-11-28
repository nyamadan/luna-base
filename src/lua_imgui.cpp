#include "lua_imgui.hpp"
#include "lua_glfw_impl.hpp"
#include "lua_native_buffer_impl.hpp"
#include "lua_utils.hpp"

#include <imgui.h>
#include <imgui_impl_glfw.h>
#include <imgui_impl_opengl3.h>

namespace {
int L_createContext(lua_State *L) {
  ImGui::CreateContext();
  return 0;
}

int L_newFrame(lua_State *L) {
  ImGui::NewFrame();
  return 0;
}

int L_render(lua_State *L) {
  ImGui::Render();
  return 0;
}

int L_showDemoWindow(lua_State *L) {
  Buffer *p_open =
      (Buffer *)luaL_testudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  if (p_open != nullptr) {
    luaL_argcheck(L, p_open->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                  "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
    luaL_argcheck(
        L, p_open->len >= sizeof(bool), 1,
        "p_open: LUA_USERDATA_TYPE_BUFFER: must be greater equal than "
        "sizeof(bool)?");
    luaL_argcheck(L, p_open->p != NULL, 1,
                  "p_open: LUA_USERDATA_TYPE_BUFFER: already free?");
  }
  ImGui::ShowDemoWindow(p_open != nullptr ? reinterpret_cast<bool *>(p_open->p)
                                          : nullptr);
  return 0;
}

int L_styleColorsDark(lua_State *L) {
  ImGui::StyleColorsDark();
  return 0;
}

int L_implOpenGL3_Init(lua_State *L) {
  ImGui_ImplOpenGL3_Init();
  return 0;
}

int L_implGlfw_InitForOpenGL(lua_State *L) {
  bool b = lua_toboolean(L, 1);
  ImGui_ImplGlfw_InitForOpenGL(get_current_glfw_window(), b);
  return 0;
}

int L_implOpenGL3_NewFrame(lua_State *L) {
  ImGui_ImplOpenGL3_NewFrame();
  return 0;
}

int L_implGlfw_NewFrame(lua_State *L) {
  ImGui_ImplGlfw_NewFrame();
  return 0;
}

int L_implOpenGL3_Shutdown(lua_State *L) {
  ImGui_ImplOpenGL3_Shutdown();
  return 0;
}

int L_implGlfw_Shutdown(lua_State *L) {
  ImGui_ImplGlfw_Shutdown();
  return 0;
}

int L_implOpenGL3_RenderDrawData(lua_State *L) {
  ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
  return 0;
}

int L_begin(lua_State *L) {
  const char *name = luaL_checkstring(L, 1);

  Buffer *p_open =
      (Buffer *)luaL_testudata(L, 2, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);

  if (p_open != nullptr) {
    luaL_argcheck(L, p_open->type != BufferType::UNSAFE_POINTER_TYPE, 2,
                  "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
    luaL_argcheck(
        L, p_open->len >= sizeof(bool), 2,
        "p_open: LUA_USERDATA_TYPE_BUFFER: must be greater equal than "
        "sizeof(bool)?");
    luaL_argcheck(L, p_open->p != NULL, 2,
                  "p_open: LUA_USERDATA_TYPE_BUFFER: already free?");
  }

  int isnum = 0;
  lua_Integer flags = lua_tointegerx(L, 3, &isnum);

  bool result = ImGui::Begin(
      name, reinterpret_cast<bool *>(p_open != nullptr ? p_open->p : nullptr),
      isnum ? flags : 0);

  lua_pushboolean(L, result);

  return 1;
}

int L_end(lua_State *L) {
  ImGui::End();
  return 0;
}

int L_text(lua_State *L) {
  const char *text = luaL_checkstring(L, 1);
  ImGui::Text("%s", text);
  return 0;
}

int L_button(lua_State *L) {
  const char *label = luaL_checkstring(L, 1);

  ImVec2 size(0.0f, 0.0f);
  if (lua_istable(L, 2)) {
    lua_pushinteger(L, 1);
    lua_gettable(L, 2);
    lua_pushinteger(L, 2);
    lua_gettable(L, 2);
    size.x = static_cast<float>(luaL_checknumber(L, -2));
    size.y = static_cast<float>(luaL_checknumber(L, -1));
  }

  bool result = ImGui::Button(label, size);
  lua_pushboolean(L, result);
  return 1;
}

int L_require(lua_State *L) {
  lua_newtable(L);

  lua_pushcfunction(L, L_createContext);
  lua_setfield(L, -2, "createContext");

  lua_pushcfunction(L, L_newFrame);
  lua_setfield(L, -2, "newFrame");

  lua_pushcfunction(L, L_styleColorsDark);
  lua_setfield(L, -2, "styleColorsDark");

  lua_pushcfunction(L, L_render);
  lua_setfield(L, -2, "render");

  lua_pushcfunction(L, L_showDemoWindow);
  lua_setfield(L, -2, "showDemoWindow");

  lua_pushcfunction(L, L_implGlfw_InitForOpenGL);
  lua_setfield(L, -2, "implGlfw_InitForOpenGL");

  lua_pushcfunction(L, L_implOpenGL3_Init);
  lua_setfield(L, -2, "implOpenGL3_Init");

  lua_pushcfunction(L, L_implGlfw_NewFrame);
  lua_setfield(L, -2, "implGlfw_NewFrame");

  lua_pushcfunction(L, L_implOpenGL3_NewFrame);
  lua_setfield(L, -2, "implOpenGL3_NewFrame");

  lua_pushcfunction(L, L_implGlfw_Shutdown);
  lua_setfield(L, -2, "implGlfw_Shutdown");

  lua_pushcfunction(L, L_implOpenGL3_Shutdown);
  lua_setfield(L, -2, "implOpenGL3_Shutdown");

  lua_pushcfunction(L, L_implOpenGL3_RenderDrawData);
  lua_setfield(L, -2, "implOpenGL3_RenderDrawData");

  lua_pushcfunction(L, L_begin);
  lua_setfield(L, -2, "begin");

  lua_pushcfunction(L, L_end);
  lua_setfield(L, -2, "end");

  lua_pushcfunction(L, L_text);
  lua_setfield(L, -2, "text");

  lua_pushcfunction(L, L_button);
  lua_setfield(L, -2, "button");

  return 1;
}
} // namespace

void lua_open_imgui_libs(lua_State *L) {
  luaL_requiref(L, "imgui", L_require, false);
}
