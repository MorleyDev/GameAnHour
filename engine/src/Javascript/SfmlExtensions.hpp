#ifndef DUKSFML_SFMLEXTENSIONS_HPP
#define DUKSFML_SFMLEXTENSIONS_HPP

#include <SFML/Graphics/RenderWindow.hpp>
#include "../Sfml/SfmlAssetStore.hpp"
#include "JavascriptEngine.hpp"

extern void attachSfml(JavascriptEngine &engine, sf::RenderWindow &window, std::vector<sf::Transform> &stack, SfmlAssetStore &assetStore, std::vector<std::unique_ptr<sf::Sound>> &activeSoundEffects);
extern void pollEvents(JavascriptEngine &engine, sf::RenderWindow &window);

#endif //DUKSFML_SFMLEXTENSIONS_HPP
