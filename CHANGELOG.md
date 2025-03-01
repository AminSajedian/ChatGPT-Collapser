# Changelog

All notable changes to this project will be documented in this file.

## [1.4] - 2025-03-01
### Fixed
- Place the global button in the form area.
- Fixed issue where the global collapse/expand button did not properly handle new messages (articles).
- Ensured the global button dynamically applies to all articles, including newly added ones.
- Resolved the need for double-clicking individual collapse/expand buttons after using the global button.

## [1.3] - 2025-02-25
### Added
- Dynamic theme color support using CSS variables (--text-primary, --main-surface-primary, --message-surface).
- Centralized color definitions and constants for better maintainability.

### Changed
- Optimized fade effect and button creation logic for improved performance.

## [1.2] - 2025-02-22
### Changed
- Increased the max height of collapsed messages.

## [1.1] - 2025-02-18
### Fixed
- Fixed issue where default Copy and Edit buttons of code blocks did not stick to the top on scrolling.

## [1.0] - 2025-02-17
### Initial Release
- Added content script to collapse/expand each ChatGPT message by its button.
- Implemented a global button to collapse/expand all ChatGPT messages.