#ifndef DUKSFML_BOX2DEXTENSIONS_HPP
#define DUKSFML_BOX2DEXTENSIONS_HPP

#include <Box2D/Common/b2Math.h>
#include <Box2D/Dynamics/b2World.h>
#include <Box2D/Collision/Shapes/b2PolygonShape.h>
#include <Box2D/Dynamics/Contacts/b2Contact.h>

#include <unordered_map>
#include <memory>

#include "JavascriptEngine.hpp"

struct Box2d_Entity {
	b2Body* body;
};

struct Box2d_CollisionPair {
	std::size_t a;
	std::size_t b;

	bool operator==(const Box2d_CollisionPair& other) const {
		return a == other.a && b == other.b;
	}
};
namespace std {
	template <> struct hash<Box2d_CollisionPair> { std::size_t operator()(const Box2d_CollisionPair& k) const { return k.a ^ (k.b << sizeof(std::size_t) * 4); } };
}

struct Box2d_Collisions : public b2ContactListener {
	void BeginContact(b2Contact* contact);
	void EndContact(b2Contact* contact);

	std::unordered_map<Box2d_CollisionPair, std::size_t> contactCounter;
	std::vector<Box2d_CollisionPair> beginContacts;
	std::vector<Box2d_CollisionPair> endContacts;
};

struct Box2d {
	Box2d() : world(b2Vec2(0.0f, 0.0f)), bodies(), nextBodyId(0) {
		world.SetContactListener(&collisions);
	}

	b2World world;
	std::unordered_map<std::size_t, std::unique_ptr<Box2d_Entity>> bodies;
	Box2d_Collisions collisions;

	std::size_t nextBodyId;
};

extern void attachBox2d(JavascriptEngine &engine, Box2d &box2d);

#endif //DUKSFML_BOX2DEXTENSIONS_HPP
