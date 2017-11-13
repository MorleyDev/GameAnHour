#include "SfmlAssetStore.hpp"
#include <iostream>

std::shared_ptr<sf::Texture> SfmlAssetStore::image(std::string name, std::string path) {
	auto found = imageStore.find(name);
	if (found != imageStore.end()) {
		return found->second;
	}
	auto texture = std::make_shared<sf::Texture>();
	if (!texture->loadFromFile(path)) {
		std::cerr << "Could not load image file " << path << std::endl;
		sf::Image image; image.create(256, 256, sf::Color::White);
		texture->loadFromImage(image);
	}
	imageStore.insert(std::make_pair(name, texture));
	return texture;
}

std::shared_ptr<sf::Font> SfmlAssetStore::font(std::string name, std::string path) {
	auto found = fontStore.find(name);
	if (found != fontStore.end()) {
		return found->second;
	}
	auto font = std::make_shared<sf::Font>();
	if (!font->loadFromFile(path)) {
		std::cerr << "Could not load font file " << path << std::endl;
		if (!font->loadFromFile("./assets/fonts/default.ttf")) {
			std::cerr << "Could not load default font file" << std::endl;
		}
	}
	fontStore.insert(std::make_pair(name, font));
	return font;
}

std::shared_ptr<sf::SoundBuffer> SfmlAssetStore::sound(std::string name, std::string path) {
	auto found = soundStore.find(name);
	if (found != soundStore.end()) {
		return found->second;
	}

	auto sound = std::make_shared<sf::SoundBuffer>();
	if (!sound->loadFromFile(path)) {
		std::cerr << "Could not load sound file " << path << std::endl;
	}
	soundStore.insert(std::make_pair(name, sound));
	return sound;
}

std::shared_ptr<sf::Music> SfmlAssetStore::music(std::string name, std::string path) {
	auto found = musicStore.find(name);
	if (found != musicStore.end()) {
		return found->second;
	}

	auto music = std::make_shared<sf::Music>();
	if (!music->openFromFile(path)) {
		std::cerr << "Could not load music file " << path << std::endl;
	}
	musicStore.insert(std::make_pair(name, music));
	return music;
}
