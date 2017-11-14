#include "SfmlAssetStore.hpp"
#include <iostream>

std::shared_ptr<sf::Texture> SfmlAssetStore::image(std::string name, std::string path) {
	auto found = imageStore.find(name);
	if (found != imageStore.end()) {
		return found->second;
	}

	auto texture = std::make_shared<sf::Texture>();
	imageStore.insert(std::make_pair(name, texture));
	sf::Image image;
	if (!image.loadFromFile(path)) {
		std::cerr << "Could not load image file " << name << " (" << path << ")" << std::endl;
		image.create(256, 256, sf::Color::White);
	}
	texture->loadFromImage(image);
	return texture;
}

std::shared_ptr<sf::Font> SfmlAssetStore::font(std::string name, std::string path) {
	auto found = fontStore.find(name);
	if (found != fontStore.end()) {
		return found->second;
	}

	auto font = std::make_shared<sf::Font>();
	if (!font->loadFromFile(path)) {
		std::cerr << "Could not load font file " << name << " (" << path << ")" << std::endl;
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
		std::cerr << "Could not load sound file " << name << " (" << path << ")" << std::endl;
	}
	soundStore.insert(std::make_pair(name, sound));
	return sound;
}

std::shared_ptr<sf::Texture> SfmlAssetStore::image(std::string name, std::string path, std::function<void (std::shared_ptr<sf::Texture>)> callback) {
	auto found = imageStore.find(name);
	if (found != imageStore.end()) {
		callback(found->second);
		return found->second;
	}

	auto texture = std::make_shared<sf::Texture>();
	imageStore.insert(std::make_pair(name, texture));

	asyncTaskQueue.push([this, path{ std::move(path) }, name{ std::move(name) }, callback{ std::move(callback) }]() {
		sf::Image image;
		if (!image.loadFromFile(path)) {
			std::cerr << "Could not load image file " << name << " (" << path << ")" << std::endl;
			image.create(256, 256, sf::Color::White);
		}
		mainThreadTaskQueue.push([this, image{ std::move(image) }, name{ std::move(name) }, callback{ std::move(callback) }]() {
			auto texture = imageStore.find(name);
			texture->second->loadFromImage(image);
			callback(texture->second);
		});
	});
	return texture;
}

std::shared_ptr<sf::Font> SfmlAssetStore::font(std::string name, std::string path, std::function<void(std::shared_ptr<sf::Font>)> callback) {
	auto found = fontStore.find(name);
	if (found != fontStore.end()) {
		callback(found->second);
		return found->second;
	}
	auto font = std::make_shared<sf::Font>();
	fontStore.insert(std::make_pair(name, font));

	asyncTaskQueue.push([this, font{std::move(font)}, path{ std::move(path) }, name{ std::move(name) }, callback{ std::move(callback) }]() {
		if (!font->loadFromFile(path)) {
			std::cerr << "Could not load font file " << name << " (" << path << ")" << std::endl;
			if (!font->loadFromFile("./assets/fonts/default.ttf")) {
				std::cerr << "Could not load default font file (./assets/fonts/default.ttf)" << std::endl;
			}
		}
		mainThreadTaskQueue.push([this, font{ std::move(font) }, callback{ std::move(callback) }]() {
			callback(font);
		});
	});
	return font;
}

std::shared_ptr<sf::SoundBuffer> SfmlAssetStore::sound(std::string name, std::string path, std::function<void(std::shared_ptr<sf::SoundBuffer>)> callback) {
	auto found = soundStore.find(name);
	if (found != soundStore.end()) {
		callback(found->second);
		return found->second;
	}

	auto sound = std::make_shared<sf::SoundBuffer>();
	soundStore.insert(std::make_pair(name, sound));

	asyncTaskQueue.push([this, sound{ std::move(sound) }, name{std::move(name)}, path{ std::move(path) }, callback{ std::move(callback) }]() {
		if (!sound->loadFromFile(path)) {
			std::cerr << "Could not load sound file " << name << " (" << path << ")" << std::endl;
		}
		mainThreadTaskQueue.push([this, sound{ std::move(sound) }, callback{ std::move(callback) }]() {
			callback(sound);
		});
	});
	return sound;
}

std::shared_ptr<sf::Music> SfmlAssetStore::music(std::string name, std::string path) {
	auto found = musicStore.find(name);
	if (found != musicStore.end()) {
		return found->second;
	}

	auto music = std::make_shared<sf::Music>();
	if (!music->openFromFile(path)) {
		std::cerr << "Could not load music file " << name << " (" << path << ")" << std::endl;
	}
	musicStore.insert(std::make_pair(name, music));
	return music;
}
