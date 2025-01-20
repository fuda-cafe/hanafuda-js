# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-20

Initial release of the Hanafuda JS library with core functionality for implementing Japanese card games, focusing on Koi-Koi.

### Added

#### Core Module

- Card type definitions and comprehensive 48-card data structure
- Collection-based card management with validation and filtering
- Deck creation with Fisher-Yates shuffle implementation
- Card matching logic and comparison functionality
- Immutable interfaces for deck and collection operations
- Serialization support for game state persistence

#### Scoring Module

- Complete yaku (役) scoring system for Koi-Koi
- Declarative pattern system for defining scoring combinations
- Configurable rule system with weather and seasonal effects
- Support for multiple scoring variants
- Hand yaku (Teyaku) validation and scoring
- Comprehensive scoring manager implementation

#### Game State Management

- Robust state serialization system
- Collection-based state storage
- Phase-based game flow management
- Card selection and matching validation
- Support for game state persistence
- Comprehensive validation checks for state integrity

#### Example Implementation

- Web-based example application
- Responsive game board layout
- Interactive card selection system
- Complete game flow implementation
- Visual feedback for game actions

### Technical Notes

- Built with TypeScript for type safety
- Compatible with both Node.js and Deno
- Comprehensive test coverage
- Detailed documentation for all modules
- Memory-efficient card index system

[0.2.0]: https://github.com/fudapop/hanafuda-js/releases/tag/v0.2.0