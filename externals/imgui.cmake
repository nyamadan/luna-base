cmake_minimum_required(VERSION 3.0.0)
project(imgui VERSION 0.1.0)

include(GNUInstallDirs)

set(SOURCES
  ${CMAKE_SOURCE_DIR}/imgui.cpp
  ${CMAKE_SOURCE_DIR}/imgui_demo.cpp
  ${CMAKE_SOURCE_DIR}/imgui_draw.cpp
  ${CMAKE_SOURCE_DIR}/imgui_tables.cpp
  ${CMAKE_SOURCE_DIR}/imgui_widgets.cpp
  ${CMAKE_SOURCE_DIR}/backends/imgui_impl_opengl3.cpp
)

if(USE_GLFW3)
  list(APPEND SOURCES ${CMAKE_SOURCE_DIR}/backends/imgui_impl_glfw.cpp)
else()
  list(APPEND SOURCES ${CMAKE_SOURCE_DIR}/backends/imgui_impl_sdl.cpp)
endif()

add_library(imgui STATIC ${SOURCES})

target_include_directories(imgui PRIVATE ${CMAKE_SOURCE_DIR} ${EXTERNALS_INCLUDE_DIR})

install(TARGETS imgui EXPORT imgui-config)

if(USE_GLFW3)
  set_property(TARGET imgui PROPERTY PUBLIC_HEADER
    ${CMAKE_SOURCE_DIR}/imgui.h
    ${CMAKE_SOURCE_DIR}/imconfig.h
    ${CMAKE_SOURCE_DIR}/backends/imgui_impl_glfw.h
    ${CMAKE_SOURCE_DIR}/backends/imgui_impl_opengl3.h
  )
else()
  set_property(TARGET imgui PROPERTY PUBLIC_HEADER
    ${CMAKE_SOURCE_DIR}/imgui.h
    ${CMAKE_SOURCE_DIR}/imconfig.h
    ${CMAKE_SOURCE_DIR}/backends/imgui_impl_sdl.h
    ${CMAKE_SOURCE_DIR}/backends/imgui_impl_opengl3.h
  )
endif()

install(TARGETS imgui
    EXPORT imgui-config
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    PUBLIC_HEADER DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)