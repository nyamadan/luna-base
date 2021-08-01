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
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, p_open != NULL, 1,
                "p_open: LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, p_open->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  luaL_argcheck(L, p_open->len >= sizeof(bool), 1,
                "p_open: LUA_USERDATA_TYPE_BUFFER: must be greater equal than "
                "sizeof(bool)?");
  luaL_argcheck(L, p_open->p != NULL, 1,
                "p_open: LUA_USERDATA_TYPE_BUFFER: already free?");
  ImGui::ShowDemoWindow(reinterpret_cast<bool *>(p_open->p));
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
  return 1;
}
} // namespace

void lua_open_imgui_libs(lua_State *L) {
  luaL_requiref(L, "imgui", L_require, false);
}
