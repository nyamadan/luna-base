
#ifndef __GL_COMMON_HPP__
#define __GL_COMMON_HPP__
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#if USE_GLFW3
#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#else
#include <SDL.h>
#endif
#else
#ifdef USE_GLFW3
#include <GL/gl3w.h>
#include <GLFW/glfw3.h>
#else
#include <GL/gl3w.h>
#include <SDL.h>
#endif
#endif
#endif
