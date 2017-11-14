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

struct Box2d_Collisions : public b2ContactListener {
	void BeginContact(b2Contact* contact) {
		const auto id = reinterpret_cast<std::size_t>( contact->GetFixtureA()->GetBody()->GetUserData() );

		auto index = contactCounter.find(id);
		if (index == contactCounter.end()) {
			contactCounter.insert(std::make_pair(id, 1));
			beginContacts.push_back(id);
		}
		else {
			index->second += 1;
		}
	}

	void EndContact(b2Contact* contact) {
		const auto id = reinterpret_cast<std::size_t>(contact->GetFixtureA()->GetBody()->GetUserData());

		auto index = contactCounter.find(id);
		if (index != contactCounter.end()) {
			index->second -= 1;
			if (index->second == 0) {
				contactCounter.erase(index);
				endContacts.push_back(id);
			}
		}
	}

	std::unordered_map<std::size_t, std::size_t> contactCounter;
	std::vector<std::size_t> beginContacts;
	std::vector<std::size_t> endContacts;
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
