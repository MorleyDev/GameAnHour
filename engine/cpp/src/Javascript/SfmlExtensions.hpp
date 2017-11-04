#ifndef DUKSFML_SFMLEXTENSIONS_HPP
#define DUKSFML_SFMLEXTENSIONS_HPP

#include <SFML/Graphics/RenderWindow.hpp>
#include "JavascriptEngine.hpp"

void attachSfml(JavascriptEngine &engine, sf::RenderWindow &window);
void draw(JavascriptEngine &engine, sf::RenderWindow &window);
void pollEvents(JavascriptEngine &engine, sf::RenderWindow &window);

#endif //DUKSFML_SFMLEXTENSIONS_HPP
