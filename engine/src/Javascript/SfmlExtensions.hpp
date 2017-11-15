#ifndef DUKSFML_SFMLEXTENSIONS_HPP
#define DUKSFML_SFMLEXTENSIONS_HPP

#include <SFML/Graphics/RenderWindow.hpp>
#include "../Sfml/SfmlAssetStore.hpp"
#include "../Concurrent/TaskQueue.hpp"
#include "JavascriptEngine.hpp"

struct Sfml {
	Sfml(std::string title, sf::VideoMode video, TaskQueue& tasks, TaskQueue& mainThreadTasks);

	sf::RenderWindow window;
	std::vector<sf::Transform> stack;
	SfmlAssetStore assetStore;
	std::vector<std::unique_ptr<sf::Sound>> activeSoundEffects;
};

extern void attachSfml(JavascriptEngine &engine, Sfml &sfml);
extern void pollEvents(JavascriptEngine &engine, Sfml &sfml);

#endif //DUKSFML_SFMLEXTENSIONS_HPP
