cmake_minimum_required(VERSION 3.5.0)
project(luna-base VERSION 0.1.0)

include(GNUInstallDirs)

include(CTest)
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/release-1.11.0.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)
enable_testing()

set(CMAKE_VERBOSE_MAKEFILE On)
set(EXTERNALS_ROOT ${PROJECT_BINARY_DIR}/externals)
set(EXTERNALS_INCLUDE_DIR 
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_INCLUDEDIR}
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_INCLUDEDIR}/gl3w
)
if(WIN32)
  if(MINGW)
    set(CMAKE_EXE_LINKER_FLAGS "-static-libgcc -static")
    set(CMAKE_EXE_LINKER_FLAGS "-static-libgcc -static-libstdc++ -static")
  endif()
endif()

set(LIB_SOURCES
  src/lua_utils.cpp
  src/lua_msgpack.cpp
  src/lua_glfw.cpp
  src/lua_imgui.cpp
  src/lua_png.cpp
  src/lua_native_buffer.cpp
)

add_library(luna-base STATIC ${LIB_SOURCES})
set_property(TARGET luna-base PROPERTY CXX_STANDARD 17)
set (LUNA_BASE_LIBS luna-base)

### Load External Project
if(UNIX AND NOT APPLE AND NOT BEOS AND NOT HAIKU AND NOT EMSCRIPTEN)
  find_library(M_LIBRARY m)
else()
  # libm is not needed and/or not available
  set(M_LIBRARY "")
endif()

include(ExternalProject)
target_include_directories(luna-base PRIVATE ${EXTERNALS_INCLUDE_DIR})

if(WIN32)
  if(MSVC)
    set(LUA_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/lua54.lib)
  else()
    set(LUA_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/liblua54.dll.a)
  endif()
else()
  set(LUA_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/liblua54.a)
endif()
ExternalProject_Add(
  lua54
  URL https://www.lua.org/ftp/lua-5.4.3.tar.gz
  URL_MD5 ef63ed2ecfb713646a7fcc583cf5f352
  PREFIX ${EXTERNALS_ROOT}
  BUILD_BYPRODUCTS ${LUA_LIB}
  CMAKE_ARGS
    -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
    -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
    -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
    -DLUA_RUNTIME_PATH:PATH=${CMAKE_BINARY_DIR}
  PATCH_COMMAND
    ${CMAKE_COMMAND} -E copy_if_different "${CMAKE_CURRENT_SOURCE_DIR}/externals/Lua.cmake" <SOURCE_DIR>/CMakeLists.txt
    && cd <SOURCE_DIR>/src && patch -t < "${CMAKE_CURRENT_SOURCE_DIR}/externals/Lua.patch"
)
add_dependencies(luna-base lua54)

if(MSVC)
  set(IMGUI ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/imgui.lib)
else()
  set(IMGUI ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libimgui.a)
endif()
ExternalProject_Add(
  imgui
  URL https://github.com/ocornut/imgui/archive/refs/tags/v1.86.zip
  URL_MD5 bccb1c173296979e6a61b4f9da572429
  PREFIX ${EXTERNALS_ROOT}
  BUILD_BYPRODUCTS ${IMGUI}
  CMAKE_ARGS
    -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
    -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
    -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
  CMAKE_CACHE_ARGS
    -DGLFW3_INCLUDE_DIR:PATH=${EXTERNALS_INCLUDE_DIR}
  PATCH_COMMAND
    ${CMAKE_COMMAND} -E copy_if_different "${CMAKE_CURRENT_SOURCE_DIR}/externals/imgui.cmake" <SOURCE_DIR>/CMakeLists.txt
)
add_dependencies(luna-base imgui)
list(APPEND LUNA_BASE_LIBS ${IMGUI})

if(MSVC)
  set(MSGPACKC_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/msgpackc.lib)
else()
  set(MSGPACKC_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libmsgpackc.a)
endif()
ExternalProject_Add(
  msgpack-c
  URL https://github.com/msgpack/msgpack-c/releases/download/c-4.0.0/msgpack-c-4.0.0.tar.gz
  URL_MD5 1b02fb40973d52f2cfa37758db69d156
  PREFIX ${EXTERNALS_ROOT}
  BUILD_BYPRODUCTS ${MSGPACKC_LIB}
  CMAKE_ARGS
    -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
    -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
    -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
  CMAKE_CACHE_ARGS
    -DMSGPACK_ENABLE_STATIC:BOOL=On
    -DMSGPACK_ENABLE_SHARED:BOOL=Off
)
add_dependencies(luna-base msgpack-c)
list(APPEND LUNA_BASE_LIBS ${MSGPACKC_LIB})

if(WIN32)
  if(MSVC)
    if ("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
      set(ZLIB_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/zlibstaticd.lib)
    else()
      set(ZLIB_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/zlibstatic.lib)
    endif()
  else()
    set(ZLIB_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libzlibstatic.a)
  endif()
else()
  set(ZLIB_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libz.a)
endif()
ExternalProject_Add(
  zlib
  URL https://www.zlib.net/zlib-1.2.11.tar.gz
  URL_MD5 1c9f62f0778697a09d36121ead88e08e
  PREFIX ${EXTERNALS_ROOT}
  BUILD_BYPRODUCTS ${ZLIB_LIB}
  CMAKE_GENERATOR "Unix Makefiles"
  CMAKE_ARGS
    -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
    -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
    -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
)
add_dependencies(luna-base zlib)

if(WIN32)
  if(MSVC)
    if ("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
      set(LIBPNG_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libpng16_staticd.lib)
    else()
      set(LIBPNG_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libpng16_static.lib)
    endif()
  else()
    if ("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
      set(LIBPNG_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libpng16d.a)
    else()
      set(LIBPNG_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libpng16.a)
    endif()
  endif()
else()
  if ("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
    set(LIBPNG_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libpng16d.a)
  else()
    set(LIBPNG_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libpng16.a)
  endif()
endif()
ExternalProject_Add(
  libpng
  URL https://download.sourceforge.net/libpng/libpng-1.6.37.tar.xz
  URL_MD5 015e8e15db1eecde5f2eb9eb5b6e59e9
  PREFIX ${EXTERNALS_ROOT}
  BUILD_BYPRODUCTS ${LIBPNG_LIB}
  CMAKE_ARGS
    -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
    -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
    -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
  CMAKE_GENERATOR "Unix Makefiles"
  CMAKE_CACHE_ARGS
    -DM_LIBRARY:PATH=${M_LIBRARY}
    -DZLIB_LIBRARY:PATH=${ZLIB_LIB}
    -DZLIB_INCLUDE_DIR:PATH=${EXTERNALS_INCLUDE_DIR}
)
add_dependencies(libpng zlib)
add_dependencies(luna-base libpng)

list(APPEND LUNA_BASE_LIBS ${LIBPNG_LIB})
list(APPEND LUNA_BASE_LIBS ${ZLIB_LIB})

if(WIN32)
  if(MSVC)
    if ("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
      set(GLSLANG_LIBS
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/GenericCodeGend.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/glslangd.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/SPIRVd.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/MachineIndependentd.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/OSDependentd.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/OGLCompilerd.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/HLSLd.lib
      )
    else()
      set(GLSLANG_LIBS
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/GenericCodeGen.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/glslang.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/SPIRV.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/MachineIndependent.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/OSDependent.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/OGLCompiler.lib
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/HLSL.lib
      )
    endif()
  else()
    if ("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
      set(GLSLANG_LIBS
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libGenericCodeGend.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libglslangd.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libSPIRVd.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libMachineIndependentd.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libOSDependentd.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libOGLCompilerd.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libHLSLd.a
      )
    else()
      set(GLSLANG_LIBS
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libGenericCodeGen.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libglslang.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libSPIRV.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libMachineIndependent.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libOSDependent.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libOGLCompiler.a
        ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libHLSL.a
      )
    endif()
  endif()
else()
  set(GLSLANG_LIBS
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libGenericCodeGen.a
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libglslang.a
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libSPIRV.a
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libMachineIndependent.a
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libOSDependent.a
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libOGLCompiler.a
    ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libHLSL.a
  )
endif()
ExternalProject_Add(
  glslang
  URL https://github.com/KhronosGroup/glslang/archive/refs/tags/11.6.0.tar.gz
  URL_MD5 37918eefd58acd7309faf96fb83ab4ce
  PREFIX ${EXTERNALS_ROOT}
  BUILD_BYPRODUCTS ${GLSLANG_LIBS}
  CMAKE_ARGS
    -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
    -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
    -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
)
add_dependencies(luna-base glslang)
list(APPEND LUNA_BASE_LIBS ${GLSLANG_LIBS})

add_custom_command(
  OUTPUT ${CMAKE_SOURCE_DIR}/src/lua_gl_bindings.cpp
  COMMAND node ${CMAKE_SOURCE_DIR}/generate_gl_bindings.js
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  DEPENDS ${CMAKE_SOURCE_DIR}/generate_gl_bindings.js)
add_library(lua_gl_bindings ${CMAKE_SOURCE_DIR}/src/lua_gl_bindings.cpp)
add_dependencies(lua_gl_bindings lua54)
target_include_directories(lua_gl_bindings PRIVATE ${EXTERNALS_INCLUDE_DIR})
add_dependencies(luna-base lua_gl_bindings)

list(APPEND LUNA_BASE_LIBS lua_gl_bindings)
list(APPEND LUNA_BASE_LIBS ${LUA_LIB})

if(NOT EMSCRIPTEN)
  if(MSVC)
    set(GLFW3_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/glfw3.lib)
  else()
    set(GLFW3_LIB ${EXTERNALS_ROOT}/${CMAKE_INSTALL_LIBDIR}/libglfw3.a)
  endif()
  ExternalProject_Add(
    GLFW3
    URL https://github.com/glfw/glfw/releases/download/3.3.4/glfw-3.3.4.zip
    URL_MD5 7cd3b5db36dc8c644871de51f478882f
    PREFIX ${EXTERNALS_ROOT}
    BUILD_BYPRODUCTS ${GLFW3_LIB}
    CMAKE_ARGS
      -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
      -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
      -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
  )
  add_dependencies(luna-base GLFW3)
  add_dependencies(lua_gl_bindings GLFW3)
  add_dependencies(imgui GLFW3)
  list(APPEND LUNA_BASE_LIBS ${GLFW3_LIB})

  set(GL3W_SRC ${EXTERNALS_ROOT}/share/gl3w/gl3w.c)
  ExternalProject_Add(
    GL3W
    URL https://github.com/skaslev/gl3w/archive/refs/heads/master.zip
    URL_MD5 fe17c6e0d841b5c168ebf448e724e3cb
    PREFIX ${EXTERNALS_ROOT}
    BUILD_BYPRODUCTS ${GL3W_SRC}
    CMAKE_ARGS
      -DCMAKE_BUILD_TYPE:PATH=${CMAKE_BUILD_TYPE}
      -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
      -DCMAKE_TOOLCHAIN_FILE:PATH=${CMAKE_TOOLCHAIN_FILE}
  )
  add_dependencies(luna-base GL3W)
  target_sources(luna-base PRIVATE ${GL3W_SRC})
endif()

add_executable(main src/main.cpp)
add_dependencies(main luna-base)
set_property(TARGET main PROPERTY CXX_STANDARD 17)
if (MSVC)
  set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR} )
  set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY_DEBUG ${PROJECT_BINARY_DIR} )
  set_target_properties(main PROPERTIES RUNTIME_OUTPUT_DIRECTORY_RELEASE ${PROJECT_BINARY_DIR} )
endif()
target_include_directories(main PRIVATE ${EXTERNALS_INCLUDE_DIR})
target_link_libraries(main ${LUNA_BASE_LIBS})
set(EMSCRIPTEN_LINK_FLAGS "\
  --use-preload-plugins \
  -s WASM=1 \
  -s MAX_WEBGL_VERSION=2 \
  -s MIN_WEBGL_VERSION=2 \
  -s USE_GLFW=3 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s ENVIRONMENT=web \
  -s NO_EXIT_RUNTIME=1 \
  -s FORCE_FILESYSTEM=1 \
  -s \"EXPORTED_RUNTIME_METHODS=['FS']\" \
  ")

if(EMSCRIPTEN)
  set_target_properties(main PROPERTIES LINK_FLAGS "${EMSCRIPTEN_LINK_FLAGS}")
endif()

add_executable(tests
  tests/test_native_buffer.cpp
)
add_dependencies(tests luna-base)
set_property(TARGET tests PROPERTY CXX_STANDARD 17)
if (MSVC)
  set_target_properties(tests PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR} )
  set_target_properties(tests PROPERTIES RUNTIME_OUTPUT_DIRECTORY_DEBUG ${PROJECT_BINARY_DIR} )
  set_target_properties(tests PROPERTIES RUNTIME_OUTPUT_DIRECTORY_RELEASE ${PROJECT_BINARY_DIR} )
endif()
target_include_directories(tests PRIVATE ${EXTERNALS_INCLUDE_DIR})
target_link_libraries(tests PRIVATE ${LUNA_BASE_LIBS} gtest_main)

if(EMSCRIPTEN)
  set_target_properties(tests PROPERTIES LINK_FLAGS "${EMSCRIPTEN_LINK_FLAGS}")
endif()

include(GoogleTest)
gtest_discover_tests(tests)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
