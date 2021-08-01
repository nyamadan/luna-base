
#ifndef __GL_COMMON_HPP__
#define __GL_COMMON_HPP__
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define GLFW_INCLUDE_ES3
#else
#include <GL/gl3w.h>
#endif
#endif
