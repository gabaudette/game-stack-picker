# Catalog source notes

Reviewed on 2026-09-30. Every catalog entry links to its official website, documentation, or maintainer repository. Cost labels deliberately describe models rather than current prices. Re-check terms and support when updating entries.

| Rule or claim | Primary source |
| --- | --- |
| Godot platform exports and renderer limitations | [Feature list](https://docs.godotengine.org/en/stable/about/list_of_features.html) |
| Godot C# web-export limitation | [C# platform support](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/index.html) |
| Unity C# scripting | [Programming in Unity](https://docs.unity3d.com/Manual/scripting.html) |
| Unity license eligibility | [Pricing updates](https://unity.com/products/pricing-updates) |
| Unreal visual scripting and C++ | [Blueprints](https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprints-visual-scripting-in-unreal-engine), [C++](https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-with-cplusplus-in-unreal-engine) |
| Unreal licensing | [License terms](https://www.unrealengine.com/license) |
| GameMaker export license terms | [Get GameMaker](https://gamemaker.io/en/get) |
| GDevelop tooling and service tiers | [GDevelop](https://gdevelop.io/), [Plans](https://gdevelop.io/pricing) |
| Phaser browser focus | [What is Phaser?](https://docs.phaser.io/phaser/getting-started/what-is-phaser) |
| SVG provenance | [Local source manifest](../public/logos/sources.json), [SVGL API](https://svgl.app/docs/api) |

Platform tags express the scope verified by this catalog, not every possible custom port. Console recommendations always carry an approval and SDK-access caveat. Other production-tool descriptions remain conservative and link to vendors for current terms and integration details. Recommendation scores are product heuristics rather than vendor claims or performance benchmarks.

## Code-first catalog expansion

| Addition | Primary source |
| --- | --- |
| Bevy 2D/3D, Rust, and supported targets | [Features](https://bevy.org/), [Setup](https://bevy.org/learn/quick-start/getting-started/setup/) |
| SFML C++, 2D renderer, and mobile caveats | [Official FAQ](https://www.sfml-dev.org/faq/general/) |
| raylib C APIs, 2D/3D, Android, and HTML5 | [Maintainer repository](https://github.com/raysan5/raylib) |
| Odin vendor bindings | [Vendor library](https://pkg.odin-lang.org/vendor/), [raylib](https://pkg.odin-lang.org/vendor/raylib/) |
| SDL3 APIs and target support | [SDL3](https://wiki.libsdl.org/SDL3/FrontPage), [Platforms](https://wiki.libsdl.org/SDL3/README-platforms) |
| LÖVE Lua and native targets | [Official site](https://love2d.org/) |
| MonoGame C# and restricted console support | [Platforms](https://docs.monogame.net/articles/getting_started/platforms.html) |
| Defold Lua, features, and license | [Introduction](https://defold.com/manuals/introduction/), [License](https://defold.com/license/) |
| Tiled and LDtk authoring | [Tiled](https://www.mapeditor.org/), [LDtk](https://ldtk.io/) |
| Krita frame animation | [Animation manual](https://docs.krita.org/en/user_manual/animation.html) |
| Rust and native build/testing | [Cargo](https://doc.rust-lang.org/cargo/), [CMake](https://cmake.org/), [Catch2](https://github.com/catchorg/Catch2), [.NET testing](https://learn.microsoft.com/en-us/dotnet/core/testing/), [Odin testing](https://pkg.odin-lang.org/core/testing/) |
| Native debugging and profiling | [RenderDoc](https://github.com/baldurk/renderdoc), [Tracy](https://github.com/wolfpld/tracy) |

The coarse mobile target groups Android and iOS. A foundation can record narrower verified mobile targets; raylib records Android only and carries a visible iOS caveat. Language bindings do not automatically inherit every C library export target. Existing tool IDs and version-1 URL keys are preserved.
