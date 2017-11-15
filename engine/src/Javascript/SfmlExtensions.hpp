#ifndef DUKSFML_SFMLEXTENSIONS_HPP
#define DUKSFML_SFMLEXTENSIONS_HPP

#include <SFML/Graphics/RenderWindow.hpp>
#include "../Sfml/SfmlAssetStore.hpp"
#include "../Concurrent/TaskQueue.hpp"

#include "DukJavascriptEngine.hpp"
#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"
#endif//GAM_CHAKRA_ENABLE

struct Sfml {
	Sfml(std::string title, sf::VideoMode video, TaskQueue& tasks, TaskQueue& mainThreadTasks);

	sf::RenderWindow window;
	std::vector<sf::Transform> stack;
	SfmlAssetStore assetStore;
	std::vector<std::unique_ptr<sf::Sound>> activeSoundEffects;
};

extern void attachSfml(DukJavascriptEngine &engine, Sfml &sfml);
extern void pollEvents(DukJavascriptEngine &engine, Sfml &sfml);

#ifdef GAM_CHAKRA_ENABLE
extern void attachSfml(ChakraJavascriptEngine &engine, Sfml &sfml);
extern void pollEvents(ChakraJavascriptEngine &engine, Sfml &sfml);
#endif

#endif //DUKSFML_SFMLEXTENSIONS_HPP
