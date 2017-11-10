#ifndef DUKSFML_BOX2DEXTENSIONS_HPP
#define DUKSFML_BOX2DEXTENSIONS_HPP

#include <Box2D/Common/b2Math.h>
#include <Box2D/Dynamics/b2World.h>
#include <Box2D/Collision/Shapes/b2PolygonShape.h>

#include <unordered_map>
#include <memory>

#include "JavascriptEngine.hpp"

struct Box2d_Entity {
	b2Body* body;
};

struct Box2d {
	Box2d() : world(b2Vec2(0.0f, 0.0f)), bodies(), nextBodyId(0) { }

	b2World world;
	std::unordered_map<std::size_t, std::unique_ptr<Box2d_Entity>> bodies;
	std::size_t nextBodyId;
};

void attachBox2d(JavascriptEngine &engine, Box2d &box2d);

#endif //DUKSFML_BOX2DEXTENSIONS_HPP
