#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2Fixture.h>
#include <Box2D/Collision/Shapes/b2CircleShape.h>
#include "Box2dExtensions.hpp"

constexpr auto Box2dScaleFactory = 1.0 / 100.0;

void Box2d_Collisions::BeginContact(b2Contact* contact) {
	auto idA = reinterpret_cast<std::size_t>(contact->GetFixtureA()->GetBody()->GetUserData());
	auto idB = reinterpret_cast<std::size_t>(contact->GetFixtureB()->GetBody()->GetUserData());
	if (idA > idB) {
		std::swap(idA, idB);
	}
	const auto pair = Box2d_CollisionPair{ idA, idB };

	auto index = contactCounter.find(pair);
	if (index == contactCounter.end()) {
		contactCounter.insert(std::make_pair(pair, 1));
		beginContacts.push_back(pair);
	}
	else {
		index->second += 1;
	}
}

void Box2d_Collisions::EndContact(b2Contact* contact) {
	auto idA = reinterpret_cast<std::size_t>(contact->GetFixtureA()->GetBody()->GetUserData());
	auto idB = reinterpret_cast<std::size_t>(contact->GetFixtureB()->GetBody()->GetUserData());
	if (idA > idB) {
		std::swap(idA, idB);
	}
	const auto pair = Box2d_CollisionPair{ idA, idB };

	auto index = contactCounter.find(pair);
	if (index != contactCounter.end()) {
		index->second -= 1;
		if (index->second == 0) {
			contactCounter.erase(index);
			endContacts.push_back(pair);
		}
	}
}

template <typename TEngine> void _attachBox2d(TEngine &engine, Box2d &box2d) {
	engine.setGlobalFunction("BOX2D_SetGravity", [&box2d](TEngine* ctx) {
		const auto x = ctx->getargf(0) * Box2dScaleFactory;
		const auto y = ctx->getargf(1) * Box2dScaleFactory;
		box2d.world.SetGravity(b2Vec2(static_cast<float>(x), static_cast<float>(y)));
		return false;
	}, 2);
	engine.setGlobalFunction("BOX2D_CreateBody_Box", [&box2d](TEngine* ctx) {
		const auto x = ctx->getargf(0) * Box2dScaleFactory;
		const auto y = ctx->getargf(1) * Box2dScaleFactory;
		const auto width = ctx->getargf(2) * Box2dScaleFactory;
		const auto height = ctx->getargf(3) * Box2dScaleFactory;
		const auto isStatic = ctx->getargb(4);
		const auto density = ctx->getargf(5);
		const auto friction = ctx->getargf(6);
		const auto restitution = ctx->getargf(7);

		const auto id = box2d.nextBodyId++;
		auto entity = std::make_unique<Box2d_Entity>();
		b2BodyDef definition;
		definition.position.Set(static_cast<float>(x + width / 2.0f), static_cast<float>(y + height / 2.0f));
		definition.type = isStatic ? b2_staticBody : b2_dynamicBody;

		b2PolygonShape shape;
		shape.SetAsBox(static_cast<float>(width / 2.0f), static_cast<float>(height / 2.0f));

		entity->body = box2d.world.CreateBody(&definition);
		entity->body->SetUserData(reinterpret_cast<void*>(id));
		auto fixture = entity->body->CreateFixture(&shape, static_cast<float>(density));
		fixture->SetRestitution(static_cast<float>(restitution));
		fixture->SetFriction(static_cast<float>(friction));
		box2d.bodies.insert(std::make_pair(id, std::move(entity)));

		ctx->push(static_cast<int>(id));
		return true;
	}, 8);
	engine.setGlobalFunction("BOX2D_CreateBody_Ball", [&box2d](TEngine* ctx) {
		const auto x = ctx->getargf(0) * Box2dScaleFactory;
		const auto y = ctx->getargf(1) * Box2dScaleFactory;
		const auto radius = ctx->getargf(2) * Box2dScaleFactory;
		const auto isStatic = ctx->getargb(3);
		const auto density = ctx->getargf(4);
		const auto friction = ctx->getargf(5);
		const auto restitution = ctx->getargf(6);

		const auto id = box2d.nextBodyId++;
		auto entity = std::make_unique<Box2d_Entity>();

		b2BodyDef definition;
		definition.position.Set(static_cast<float>(x), static_cast<float>(y));
		definition.type = isStatic ? b2_staticBody : b2_dynamicBody;

		b2CircleShape shape;
		shape.m_radius = static_cast<float>(radius);

		entity->body = box2d.world.CreateBody(&definition);
		entity->body->SetUserData(reinterpret_cast<void*>(id));
		auto fixture = entity->body->CreateFixture(&shape, static_cast<float>(density));
		fixture->SetRestitution(static_cast<float>(restitution));
		fixture->SetFriction(static_cast<float>(friction));
		box2d.bodies.insert(std::make_pair(id, std::move(entity)));

		ctx->push(static_cast<int>(id));
		return true;
	}, 7);
	engine.setGlobalFunction("BOX2D_CreateBody_Tri", [&box2d](TEngine* ctx) {
		const auto x1 = ctx->getargf(0) * Box2dScaleFactory;
		const auto y1 = ctx->getargf(1) * Box2dScaleFactory;
		const auto x2 = ctx->getargf(2) * Box2dScaleFactory;
		const auto y2 = ctx->getargf(3) * Box2dScaleFactory;
		const auto x3 = ctx->getargf(4) * Box2dScaleFactory;
		const auto y3 = ctx->getargf(5) * Box2dScaleFactory;
		const auto isStatic = ctx->getargb(6);
		const auto density = ctx->getargf(7);
		const auto friction = ctx->getargf(8);
		const auto restitution = ctx->getargf(9);

		const auto centreX = static_cast<float>(x1 + x2 + x3) / 3.0f;
		const auto centreY = static_cast<float>(y1 + y2 + y3) / 3.0f;

		const auto id = box2d.nextBodyId++;
		auto entity = std::make_unique<Box2d_Entity>();
		b2BodyDef definition;
		definition.position.Set(centreX, centreY);
		definition.type = isStatic ? b2_staticBody : b2_dynamicBody;

		b2PolygonShape shape;
		b2Vec2 vertices[3];
		vertices[0] = b2Vec2(static_cast<float>(x1 - centreX), static_cast<float>(y1 - centreY));
		vertices[1] = b2Vec2(static_cast<float>(x2 - centreX), static_cast<float>(y2 - centreY));
		vertices[2] = b2Vec2(static_cast<float>(x3 - centreX), static_cast<float>(y3 - centreY));
		shape.Set(vertices, 3);

		entity->body = box2d.world.CreateBody(&definition);
		entity->body->SetUserData(reinterpret_cast<void*>(id));
		auto fixture = entity->body->CreateFixture(&shape, static_cast<float>(density));
		fixture->SetRestitution(static_cast<float>(restitution));
		fixture->SetFriction(static_cast<float>(friction));
		box2d.bodies.insert(std::make_pair(id, std::move(entity)));

		ctx->push(static_cast<int>(id));
		return true;
	}, 10);

	engine.setGlobalFunction("BOX2D_Advance", [&box2d](TEngine* ctx) {
		auto deltaTime = ctx->getargf(0);
		box2d.world.Step(static_cast<float>(deltaTime), 6, 2);
		return false;
	}, 1);

	engine.setGlobalFunction("BOX2D_GetBody", [&box2d](TEngine* ctx) {
		auto id = ctx->getargf(0);
		auto entry = box2d.bodies.find(static_cast<std::size_t>(id));
		if (entry == box2d.bodies.end()) {
			return false;
		}
		auto pos = entry->second->body->GetPosition();
		auto vel = entry->second->body->GetLinearVelocity();
		auto angular = entry->second->body->GetAngularVelocity();
		auto angle = entry->second->body->GetAngle();

		ctx->pushObject();

		ctx->push(pos.x / Box2dScaleFactory);
		ctx->putProp(-2, "positionX");

		ctx->push(pos.y / Box2dScaleFactory);
		ctx->putProp(-2, "positionY");

		ctx->push(vel.x / Box2dScaleFactory);
		ctx->putProp(-2, "velocityX");

		ctx->push(vel.y / Box2dScaleFactory);
		ctx->putProp(-2, "velocityY");

		ctx->push(angular);
		ctx->putProp(-2, "angularVelocity");

		ctx->push(angle);
		ctx->putProp(-2, "angle");
		return true;
	}, 1);

	engine.setGlobalFunction("BOX2D_DestroyBody", [&box2d](TEngine* ctx) {
		auto bodyId = ctx->getargn(0);
		auto entry = box2d.bodies.find(static_cast<std::size_t>(bodyId));
		if (entry != box2d.bodies.end()) {
			box2d.world.DestroyBody(entry->second->body);
			box2d.bodies.erase(entry);
		}
		return false;
	}, 1);
	engine.setGlobalFunction("BOX2D_GetCollisionStartCount", [&box2d](TEngine* ctx) {
		ctx->push( static_cast<unsigned int>(box2d.collisions.beginContacts.size()) );
		return true;
	}, 0);
	engine.setGlobalFunction("BOX2D_GetCollisionEndCount", [&box2d](TEngine* ctx) {
		ctx->push( static_cast<unsigned int>(box2d.collisions.endContacts.size()) );
		return true;
	}, 0);
	engine.setGlobalFunction("BOX2D_PullCollisionStart", [&box2d](TEngine* ctx) {
		if (box2d.collisions.beginContacts.empty()) {
			return false;
		}
		auto col = box2d.collisions.beginContacts.back();
		box2d.collisions.beginContacts.pop_back();
		ctx->pushObject();
		ctx->push(static_cast<unsigned int>(col.a));
		ctx->putProp(-2, "a");
		ctx->push(static_cast<unsigned int>(col.b));
		ctx->putProp(-2, "b");
		return true;
	}, 0);
	engine.setGlobalFunction("BOX2D_PullCollisionEnd", [&box2d](TEngine* ctx) {
		if (box2d.collisions.endContacts.empty()) {
			return false;
		}
		auto col = box2d.collisions.endContacts.back();
		box2d.collisions.endContacts.pop_back();
		ctx->pushObject();
		ctx->push(static_cast<unsigned int>(col.a));
		ctx->putProp(-2, "a");
		ctx->push(static_cast<unsigned int>(col.b));
		ctx->putProp(-2, "b");
		return true;
	}, 0);
	engine.setGlobalFunction("BOX2D_ApplyForce", [&box2d](TEngine* ctx) {
		const auto bodyId = ctx->getargn(0);
		const auto locationX = ctx->getargf(1);
		const auto locationY = ctx->getargf(2);
		const auto forceX = ctx->getargf(3);
		const auto forceY = ctx->getargf(4);
		const auto entry = box2d.bodies.find(static_cast<std::size_t>(bodyId));
		if (entry != box2d.bodies.end()) {
			entry->second->body->ApplyForce(
				b2Vec2(static_cast<float>(forceX), static_cast<float>(forceY)),
				b2Vec2(static_cast<float>(locationX), static_cast<float>(locationY)),
				true
			);
		}
		return false;
	}, 5);
}


void attachBox2d(DukJavascriptEngine &engine, Box2d &box2d) {
	_attachBox2d(engine, box2d);
}

#ifdef GAM_CHAKRA_ENABLE
void attachBox2d(ChakraJavascriptEngine &engine, Box2d &box2d) {
	_attachBox2d(engine, box2d);
}
#endif//GAM_CHAKRA_ENABLE
