# Ресурсы графики

Страница загружает модели, текстуры, фотографии, видео и звук из локальных JS-пакетов с данными. Оригиналы или рабочие копии используемых ресурсов лежат в `assets/`. Интернет при запуске не требуется.

## Материалы, мебель и окружение

- ambientCG [Fabric030](https://ambientcg.com/a/Fabric030) используется на абажуре и резервной модели дивана. Цвет, нормали и шероховатость 2K подготовлены в WebP и включены в `materials-packed.js`. [Лицензия ambientCG](https://docs.ambientcg.com/license/).
- Poly Haven [Laminate Floor 02](https://polyhaven.com/a/laminate_floor_02) и [Dirty Carpet](https://polyhaven.com/a/dirty_carpet) используются для пола и ковра. Карты 2K включены в `wood-packed.js` и `textile-packed.js`.
- Poly Haven [Oak Veneer 01](https://polyhaven.com/a/oak_veneer_01) используется для столешницы, [Terlenka](https://polyhaven.com/a/terlenka) для штор, [Scuffed Cement](https://polyhaven.com/a/scuffed_cement) для камина. Исходные карты лежат в `assets/finishes/`. Рабочие карты WebP включены в `finishes-packed.js`. Цвет и шероховатость ткани адаптированы под оливковую палитру.
- [Quatrefoil Jacquard Fabric](https://polyhaven.com/a/quatrefoil_jacquard_fabric) от Poly Haven используется как основа для матовых обоев. Исходные карты 1K сохранены в `assets/wallpaper/`. Цвет переведён в тёплую льняную палитру, тканый рисунок усилен, шероховатость поднята. Копии WebP включены в `wallpaper-packed.js`.
- Диван [Sofa 03](https://polyhaven.com/a/sofa_03) — Fran Calvente. Растение [Potted Plant 04](https://polyhaven.com/a/potted_plant_04) — James Ray Cock. Шкаф [Modern Wooden Cabinet](https://polyhaven.com/a/modern_wooden_cabinet) — Patrik Pangerl. Стулья [School Chair 01](https://polyhaven.com/a/SchoolChair_01) — Ethan Place. Исходные glTF и текстуры находятся в `assets/models/`, данные для запуска в `models-packed.js` и `chair-packed.js`. Для стульев подготовлена отдельная терракотовая карта цвета с тёплым оттенком металлического каркаса.
- [Modern Evening Street](https://polyhaven.com/a/modern_evening_street) — Grzegorz Wronkowski. HDR и перспективная проекция панорамы для окна включены в `evening-packed.js`.

Ресурсы ambientCG и Poly Haven распространяются по [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). [Лицензия Poly Haven](https://polyhaven.com/license). Powered by Poly Haven.

## Кот и картина

- [Domestic cat curled asleep](https://www.innerscene.com/tools/library/3d-parts/domestic-cat-curled-asleep-73a8a293) — Innerscene, CC0. Исходный GLB лежит в `assets/models/domestic-cat-curled-asleep.glb`, автономная копия в `cat-packed.js`. Кончик хвоста и дыхание анимируются отдельно.
- Основа фактуры шерсти — фотография [Brown classic tabby cat close 01](https://commons.wikimedia.org/wiki/File:Brown_classic_tabby_cat_close_01.jpg) автора Tsaag Valren, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Снимок кадрирован и переведён в карту деталей с повторяемыми краями. Исходник и производная карта лежат в `assets/cat-coat/`. Карта встроена в `cat-packed.js` и распространяется по CC BY-SA 4.0.
- Building of the St. Petersburg electrotechnical Institute (LETI) — Vitold Muratov, 24 июля 2019 года, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). [Оригинал фотографии](https://commons.wikimedia.org/wiki/File:Building_of_the_St._Petersburg_electrotechnical_Institute_(_LETI).jpg). Уменьшенная до 2048 px версия сохранена в JPEG и включена в `picture-packed.js`.

## Код и авторские детали

Three.js r160 и дополнения распространяются по MIT. [Лицензия в проекте](THREE-LICENSE.txt) и [исходный код Three.js](https://github.com/mrdoob/three.js/tree/r160). esbuild 0.25.12 используется для сборки и также распространяется по MIT.

Корпуса устройств, оконная рама, складки штор, датчики, кружка, пар, светящаяся линия, кладка камина, мелкий декор и интерфейсы экранов созданы в проекте. Ноутбук и смартфон ориентированы на общий силуэт MacBook Air 13 M2 и iPhone 15, без фирменных знаков. Прозрачность окна, отражения и тени рассчитаны растровыми средствами. `studio.png`, `office.png` и `living-room.png` сохранены из предыдущей поставки, поскольку на них ссылаются стили резервного вида.

Для воспроизведения отдельных пакетов из корня проекта используйте `python scripts/pack_materials.py` для Fabric030 (нужен Pillow), `python scripts/fetch_wood.py` для пола и `python scripts/fetch_models.py` для моделей дивана, растения и шкафа. Готовые пакеты остаются в поставке.

## Огонь и звук

- [Kaminfeuer](https://commons.wikimedia.org/wiki/File:Kaminfeuer.webm) — Larvis, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Съёмка горящих поленьев кадрирована, уменьшена и зациклена с плавным переходом. Видео, стоп-кадр и их копии в пакете распространяются по CC BY-SA 4.0.
- [Fireplace wood crackling](https://freesound.org/people/Sadiquecat/sounds/707262/) — Sadiquecat, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Запись потрескивания дров обрезана и зациклена. Низкочастотный гул отфильтрован, самые громкие щелчки приглушены. Звук воспроизводится отдельной дорожкой.
- Готовые файлы лежат в `assets/fireplace/`. Для запуска с диска они включены в `fireplace-packed.js` вместе с рядом значений яркости кадров, по которому меняется свет камина.
