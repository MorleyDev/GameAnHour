#ifndef DUKSFML_SFMLASSETSTORE_HPP
#define DUKSFML_SFMLASSETSTORE_HPP

#include "../Concurrent/TaskQueue.hpp"

#include <SFML/Graphics/Texture.hpp>
#include <SFML/Graphics/Font.hpp>
#include <SFML/Audio/SoundBuffer.hpp>
#include <SFML/Audio/Music.hpp>

#include <functional>
#include <unordered_map>
#include <string>
#include <memory>

class SfmlAssetStore {
private:
	TaskQueue &asyncTaskQueue;
	TaskQueue &mainThreadTaskQueue;

	std::unordered_map<std::string, std::shared_ptr<sf::Texture>> imageStore;
	std::unordered_map<std::string, std::shared_ptr<sf::Font>> fontStore;
	std::unordered_map<std::string, std::shared_ptr<sf::SoundBuffer>> soundStore;
	std::unordered_map<std::string, std::shared_ptr<sf::Music>> musicStore;

public:
	SfmlAssetStore(TaskQueue &asyncTaskQueue, TaskQueue &mainThreadTaskQueue)
		: asyncTaskQueue(asyncTaskQueue),
		  mainThreadTaskQueue(mainThreadTaskQueue) {
	}

	std::shared_ptr<sf::Texture> image(std::string name, std::string path);
	std::shared_ptr<sf::Font> font(std::string name, std::string path);
	std::shared_ptr<sf::SoundBuffer> sound(std::string name, std::string path);

	std::shared_ptr<sf::Texture> image(std::string name, std::string path, std::function<void(std::shared_ptr<sf::Texture>)> callback);
	std::shared_ptr<sf::Font> font(std::string name, std::string path, std::function<void(std::shared_ptr<sf::Font>)> callback);
	std::shared_ptr<sf::SoundBuffer> sound(std::string name, std::string path, std::function<void(std::shared_ptr<sf::SoundBuffer>)> callback);

	std::shared_ptr<sf::Music> music(std::string name, std::string path);
};

#endif//DUKSFML_SFMLASSETSTORE_HPP
