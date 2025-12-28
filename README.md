# ⛽ Gasolineras y Puntos de Recarga - País Vasco

Aplicación web interactiva que muestra en tiempo real las gasolineras y puntos de recarga eléctrica del País Vasco sobre Google Maps, con información actualizada de precios de combustible y características de los puntos de carga.

## 🌟 Características

- **Mapa interactivo**: Visualización de gasolineras y puntos de recarga sobre Google Maps
- **Datos en tiempo real**: Información actualizada de precios de combustibles
- **Filtros avanzados**:
  - Por provincia (Álava, Bizkaia, Gipuzkoa)
  - Por municipio
  - Por tipo de combustible (Gasóleo A, Gasolina 95, Gasolina 98)
  - Por potencia de recarga (rápida ≥50kW, lenta <50kW)
- **Marcadores diferenciados**: Iconos distintos para gasolineras y puntos de recarga
- **Información detallada**: Ventanas emergentes con datos completos de cada establecimiento
- **Contador en vivo**: Número de resultados según los filtros aplicados

## 🚀 Demo

[Ver aplicación en vivo](https://jsersan.github.io/gasolinerasgooglemaps/)

## 📋 Requisitos previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para cargar Google Maps API y los datos actualizados

## 🛠️ Instalación

1. Clona este repositorio:

git clone https://github.com/jsersan/gasolinerasgooglemaps.git

2. Navega al directorio del proyecto:

cd gasolinerasgooglemaps


3. Abre `index.html` en tu navegador o utiliza un servidor local.

## 🔧 Configuración

### API Key de Google Maps

El proyecto incluye una API Key de Google Maps en el archivo `index.html`. Para uso en producción, es recomendable:

1. Obtener tu propia API Key en [Google Cloud Console](https://console.cloud.google.com/)
2. Reemplazar la key en `index.html`:

<script async defer src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=initMap&loading=async"> </script>


## 💡 Uso

1. **Visualización**: Al cargar la página, se muestran automáticamente todas las gasolineras y puntos de recarga del País Vasco
2. **Filtrado por ubicación**: Selecciona una provincia y/o municipio específico
3. **Filtrado por tipo**: Activa o desactiva la visualización de gasolineras o puntos de recarga
4. **Filtrado por combustible**: Selecciona el tipo de combustible que te interesa
5. **Filtrado por recarga**: Filtra por potencia de carga (rápida o lenta)
6. **Interacción**: Haz clic en cualquier marcador para ver información detallada

## 🎨 Características técnicas

- **Tecnologías**: HTML5, CSS3, JavaScript vanilla
- **API**: Google Maps JavaScript API
- **Datos**: Fuentes de datos públicas actualizadas
- **Responsive**: Diseño adaptable a diferentes dispositivos
- **Performance**: Carga asíncrona y gestión eficiente de marcadores

## 📊 Fuentes de datos

Los datos de gasolineras y precios de combustible provienen de fuentes oficiales del Ministerio para la Transición Ecológica y el Reto Demográfico de España.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar este proyecto:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Mejoras futuras

- [ ] Añadir cálculo de rutas hasta gasolineras/puntos de recarga
- [ ] Implementar búsqueda por precio más bajo
- [ ] Añadir histórico de precios
- [ ] Incluir reseñas y valoraciones de usuarios
- [ ] Modo oscuro
- [ ] Guardar favoritos en localStorage

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👤 Autor

**Txema Serrano**

- GitHub: [@jsersan](https://github.com/jsersan)
- Web: [txemaserrano.com](https://txemaserrano.com)

## 🙏 Agradecimientos

- Google Maps API por proporcionar la plataforma de mapas
- Datos abiertos del Gobierno de España
- Comunidad de desarrolladores del País Vasco

---

⭐ Si este proyecto te resulta útil, ¡considera darle una estrella en GitHub!

