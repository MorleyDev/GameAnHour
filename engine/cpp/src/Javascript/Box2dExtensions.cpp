#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2Fixture.h>
#include <Box2D/Collision/Shapes/b2CircleShape.h>
#include <iostream>
#include "Box2dExtensions.hpp"

constexpr auto Box2dScaleFactory = 1.0 / 100.0;

void attachBox2d(JavascriptEngine &engine, Box2d &box2d) {
    engine.setGlobalFunction("BOX2D_SetGravity", [&box2d](JavascriptEngine* ctx) {
        const auto x = ctx->getFloat(-2) * Box2dScaleFactory;
        const auto y = ctx->getFloat(-1) * Box2dScaleFactory;
        box2d.world.SetGravity(b2Vec2(static_cast<float>(x), static_cast<float>(y)));
        return false;
    }, 2);
    engine.setGlobalFunction("BOX2D_CreateBody_Box", [&box2d](JavascriptEngine* ctx) {
        const auto x = ctx->getFloat(-8) * Box2dScaleFactory;
        const auto y = ctx->getFloat(-7) * Box2dScaleFactory;
        const auto width = ctx->getFloat(-6) * Box2dScaleFactory;
        const auto height = ctx->getFloat(-5) * Box2dScaleFactory;
        const auto isStatic = ctx->getBoolean(-4);
        const auto density = ctx->getFloat(-3);
        const auto friction = ctx->getFloat(-2);
        const auto restitution = ctx->getFloat(-1);

        const auto id = box2d.nextBodyId++;
        auto entity = std::make_unique<Box2d_Entity>();
        b2BodyDef definition;
        definition.position.Set(static_cast<float>(x + width / 2.0f), static_cast<float>(y + height / 2.0f));
        definition.type = isStatic ? b2_staticBody : b2_dynamicBody;

        b2PolygonShape shape;
        shape.SetAsBox(static_cast<float>(width / 2.0f), static_cast<float>(height / 2.0f));

        entity->body = box2d.world.CreateBody(&definition);
        auto fixture = entity->body->CreateFixture(&shape, static_cast<float>(density));
        fixture->SetRestitution(static_cast<float>(restitution));
        fixture->SetFriction(static_cast<float>(friction));
        box2d.bodies.insert(std::make_pair(id, std::move(entity)));

        ctx->push(static_cast<int>(id));
        return true;
    }, 8);
    engine.setGlobalFunction("BOX2D_CreateBody_Ball", [&box2d](JavascriptEngine* ctx) {
        const auto x = ctx->getFloat(-7) * Box2dScaleFactory;
        const auto y = ctx->getFloat(-6) * Box2dScaleFactory;
        const auto radius = ctx->getFloat(-5) * Box2dScaleFactory;
        const auto isStatic = ctx->getBoolean(-4);
        const auto density = ctx->getFloat(-3);
        const auto friction = ctx->getFloat(-2);
        const auto restitution = ctx->getFloat(-1);

        const auto id = box2d.nextBodyId++;
        auto entity = std::make_unique<Box2d_Entity>();

        b2BodyDef definition;
        definition.position.Set(static_cast<float>(x), static_cast<float>(y));
        definition.type = isStatic ? b2_staticBody : b2_dynamicBody;

        b2CircleShape shape;
        shape.m_radius = static_cast<float>(radius);

        entity->body = box2d.world.CreateBody(&definition);
        auto fixture = entity->body->CreateFixture(&shape, static_cast<float>(density));
        fixture->SetRestitution(static_cast<float>(restitution));
        fixture->SetFriction(static_cast<float>(friction));
        box2d.bodies.insert(std::make_pair(id, std::move(entity)));

        ctx->push(static_cast<int>(id));
        return true;
    }, 7);
    engine.setGlobalFunction("BOX2D_CreateBody_Tri", [&box2d](JavascriptEngine* ctx) {
        const auto x1 = ctx->getFloat(-10) * Box2dScaleFactory;
        const auto y1 = ctx->getFloat(-9) * Box2dScaleFactory;
        const auto x2 = ctx->getFloat(-8) * Box2dScaleFactory;
        const auto y2 = ctx->getFloat(-7) * Box2dScaleFactory;
        const auto x3 = ctx->getFloat(-6) * Box2dScaleFactory;
        const auto y3 = ctx->getFloat(-5) * Box2dScaleFactory;
        const auto isStatic = ctx->getBoolean(-4);
        const auto density = ctx->getFloat(-3);
        const auto friction = ctx->getFloat(-2);
        const auto restitution = ctx->getFloat(-1);

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
        auto fixture = entity->body->CreateFixture(&shape, static_cast<float>(density));
        fixture->SetRestitution(static_cast<float>(restitution));
        fixture->SetFriction(static_cast<float>(friction));
        box2d.bodies.insert(std::make_pair(id, std::move(entity)));

        ctx->push(static_cast<int>(id));
        return true;
    }, 10);

    engine.setGlobalFunction("BOX2D_Advance", [&box2d](JavascriptEngine* ctx) {
        auto deltaTime = ctx->getFloat(-1);
        box2d.world.Step(static_cast<float>(deltaTime), 6, 2);
        return false;
    }, 1);

    engine.setGlobalFunction("BOX2D_GetBody", [&box2d](JavascriptEngine* ctx) {
        auto id = ctx->getFloat(-1);
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

    engine.setGlobalFunction("BOX2D_DestroyBody", [&box2d](JavascriptEngine* ctx) {
        auto bodyId = ctx->getInt(-1);
        auto entry = box2d.bodies.find(static_cast<std::size_t>(bodyId));
        if (entry != box2d.bodies.end()) {
            box2d.world.DestroyBody(entry->second->body);
            box2d.bodies.erase(entry);
        }
        return false;
    }, 1);
}