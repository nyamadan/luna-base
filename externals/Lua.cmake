cmake_minimum_required(VERSION 3.0.0)
project(lua54 VERSION 0.1.0)

include(GNUInstallDirs)

set(LUA_SOURCES
  ./src/lapi.c
  ./src/lcode.c
  ./src/lctype.c
  ./src/ldebug.c
  ./src/ldo.c
  ./src/ldump.c
  ./src/lfunc.c
  ./src/lgc.c
  ./src/llex.c
  ./src/lmem.c
  ./src/lobject.c
  ./src/lopcodes.c
  ./src/lparser.c
  ./src/lstate.c
  ./src/lstring.c
  ./src/ltable.c
  ./src/ltm.c
  ./src/lundump.c
  ./src/lvm.c
  ./src/lzio.c
  ./src/lauxlib.c
  ./src/lbaselib.c
  ./src/ldblib.c
  ./src/liolib.c
  ./src/lmathlib.c
  ./src/loslib.c
  ./src/ltablib.c
  ./src/lstrlib.c
  ./src/lutf8lib.c
  ./src/loadlib.c
  ./src/lcorolib.c
  ./src/linit.c
)

if(EMSCRIPTEN)
  add_library(lua54 STATIC ${LUA_SOURCES})
else()
  add_library(lua54 SHARED ${LUA_SOURCES})
endif()

install(TARGETS lua54 EXPORT lua-config)

set_property(TARGET lua54 PROPERTY PUBLIC_HEADER
  ./src/lapi.h
  ./src/lauxlib.h
  ./src/lcode.h
  ./src/lctype.h
  ./src/ldebug.h
  ./src/ldo.h
  ./src/lfunc.h
  ./src/lgc.h
  ./src/ljumptab.h
  ./src/llex.h
  ./src/llimits.h
  ./src/lmem.h
  ./src/lobject.h
  ./src/lopcodes.h
  ./src/lopnames.h
  ./src/lparser.h
  ./src/lprefix.h
  ./src/lstate.h
  ./src/lstring.h
  ./src/ltable.h
  ./src/ltm.h
  ./src/lua.h
  ./src/luaconf.h
  ./src/lualib.h
  ./src/lundump.h
  ./src/lvm.h
  ./src/lzio.h
)

install(TARGETS lua54
    EXPORT lua-config
    RUNTIME DESTINATION ${LUA_RUNTIME_PATH}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    PUBLIC_HEADER DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)
