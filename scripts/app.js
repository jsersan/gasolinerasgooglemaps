// Variables globales
var map, infowindow;
var todasGasolineras = [];
var todosPuntosRecarga = [];
var todosMarkers = [];

// Función principal de inicialización
function initMap() {
    console.log('*** INICIANDO MAPA ***');
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: new google.maps.LatLng(43.1842084, -2.4893427),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    infowindow = new google.maps.InfoWindow();
    
    cargarDatos();
    
    // IMPORTANTE: Configurar filtros después de cargar el DOM
    setTimeout(configurarFiltros, 100);
}

function cargarDatos() {
    var loadingDiv = document.getElementById('loading');
    loadingDiv.textContent = 'Cargando gasolineras...';
    
    cargarGasolineras(function() {
        loadingDiv.textContent = 'Cargando puntos de recarga eléctrica...';
        cargarPuntosRecarga(function() {
            loadingDiv.style.display = 'none';
            llenarComboMunicipios();
            aplicarFiltros();
        });
    });
}

function cargarGasolineras(callback) {
    var provinciasVascas = [
        { id: '01', nombre: 'ÁLAVA' },
        { id: '48', nombre: 'BIZKAIA' },
        { id: '20', nombre: 'GIPUZKOA' }
    ];
    
    var provinciasCargadas = 0;

    provinciasVascas.forEach(function(provincia) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.timeout = 15000;
        
        xmlhttp.ontimeout = function() {
            console.error('Timeout al cargar ' + provincia.nombre);
            provinciasCargadas++;
            checkCompletado();
        };

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    try {
                        var data = JSON.parse(this.responseText);
                        if (data.ListaEESSPrecio) {
                            todasGasolineras = todasGasolineras.concat(data.ListaEESSPrecio);
                        }
                    } catch (e) {
                        console.error('Error al parsear JSON de ' + provincia.nombre, e);
                    }
                } else {
                    console.error('Error al cargar ' + provincia.nombre + ': ' + this.status);
                }
                provinciasCargadas++;
                checkCompletado();
            }
        };

        var url = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/' + provincia.id;
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    });

    function checkCompletado() {
        if (provinciasCargadas === provinciasVascas.length) {
            console.log('Gasolineras cargadas: ' + todasGasolineras.length);
            callback();
        }
    }
}

function cargarPuntosRecarga(callback) {
    cargarPuntosRecargaEstaticos();
    
    var urls = [
        'https://api.openchargemap.io/v3/poi/?output=json&countrycode=ES&latitude=43.3&longitude=-2.9&distance=80&maxresults=200',
        'https://api.openchargemap.io/v3/poi/?output=json&countrycode=ES&latitude=43.0&longitude=-2.5&distance=80&maxresults=200',
        'https://api.openchargemap.io/v3/poi/?output=json&countrycode=ES&latitude=42.8&longitude=-2.7&distance=80&maxresults=200'
    ];
    
    var completadas = 0;
    var todosDatos = [];
    
    urls.forEach(function(url) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.timeout = 10000;
        
        xmlhttp.ontimeout = function() {
            console.warn('Timeout en Open Charge Map');
            completadas++;
            checkCompletado();
        };

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    try {
                        var data = JSON.parse(this.responseText);
                        if (data && Array.isArray(data)) {
                            todosDatos = todosDatos.concat(data);
                        }
                    } catch (e) {
                        console.error('Error al parsear JSON de puntos de recarga', e);
                    }
                }
                completadas++;
                checkCompletado();
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    });
    
    function checkCompletado() {
        if (completadas === urls.length) {
            var idsVistos = new Set();
            todosDatos.forEach(function(punto) {
                if (punto.ID && !idsVistos.has(punto.ID)) {
                    idsVistos.add(punto.ID);
                    todosPuntosRecarga.push(punto);
                }
            });
            
            console.log('Puntos de recarga cargados: ' + todosPuntosRecarga.length);
            callback();
        }
    }
}

function cargarPuntosRecargaEstaticos() {
    var puntosEstaticos = [
        { AddressInfo: { Title: "Ibil - Bilbao Centro", Latitude: 43.2630, Longitude: -2.9350, Town: "Bilbao", AddressLine1: "Plaza Circular" }, OperatorInfo: { Title: "Ibil" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "Type 2" }, PowerKW: 50 }] },
        { AddressInfo: { Title: "Ibil - San Sebastián Centro", Latitude: 43.3183, Longitude: -1.9812, Town: "Donostia-San Sebastián", AddressLine1: "Boulevard" }, OperatorInfo: { Title: "Ibil" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "Type 2" }, PowerKW: 50 }] },
        { AddressInfo: { Title: "Ibil - Vitoria Centro", Latitude: 42.8467, Longitude: -2.6716, Town: "Vitoria-Gasteiz", AddressLine1: "Plaza de la Virgen Blanca" }, OperatorInfo: { Title: "Ibil" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "Type 2" }, PowerKW: 50 }] },
        { AddressInfo: { Title: "Repsol - Bilbao", Latitude: 43.2567, Longitude: -2.9234, Town: "Bilbao", AddressLine1: "Zabalburu" }, OperatorInfo: { Title: "Repsol" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "CCS" }, PowerKW: 150 }] },
        { AddressInfo: { Title: "Wenea - Parque Comercial Garbera", Latitude: 43.3025, Longitude: -1.9750, Town: "Donostia-San Sebastián", AddressLine1: "Garbera" }, OperatorInfo: { Title: "Wenea" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "Type 2" }, PowerKW: 22 }] },
        { AddressInfo: { Title: "Tesla Supercharger - Vitoria", Latitude: 42.8500, Longitude: -2.6800, Town: "Vitoria-Gasteiz", AddressLine1: "N-1" }, OperatorInfo: { Title: "Tesla" }, UsageType: { Title: "Tesla/Público" }, Connections: [{ ConnectionType: { Title: "Tesla Supercharger" }, PowerKW: 250 }] },
        { AddressInfo: { Title: "Iberdrola - Getxo", Latitude: 43.3544, Longitude: -3.0128, Town: "Getxo", AddressLine1: "Avda. de los Chopos" }, OperatorInfo: { Title: "Iberdrola" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "Type 2" }, PowerKW: 22 }] },
        { AddressInfo: { Title: "Ibil - Barakaldo", Latitude: 43.2958, Longitude: -2.9889, Town: "Barakaldo", AddressLine1: "Megapark" }, OperatorInfo: { Title: "Ibil" }, UsageType: { Title: "Público" }, Connections: [{ ConnectionType: { Title: "Type 2" }, PowerKW: 50 }] }
    ];
    todosPuntosRecarga = puntosEstaticos;
}

function llenarComboMunicipios() {
    var select = document.getElementById('filtroMunicipio');
    var provinciaSeleccionada = document.getElementById('filtroProvincia').value;
    
    // Si está en "Todas", deshabilitar el combo
    if (provinciaSeleccionada === 'todas') {
        select.disabled = true;
        select.innerHTML = '<option value="todos">Selecciona primero una provincia</option>';
    } else {
        select.disabled = false;
        select.innerHTML = '<option value="todos">Todos</option>';
    }
}

function configurarFiltros() {
    console.log('*** CONFIGURANDO FILTROS ***');
    
    var filtroProvincia = document.getElementById('filtroProvincia');
    var filtroMunicipio = document.getElementById('filtroMunicipio');
    var filtroCombustible = document.getElementById('filtroCombustible');
    var filtroPotenciaRecarga = document.getElementById('filtroPotenciaRecarga');
    var mostrarGasolineras = document.getElementById('mostrarGasolineras');
    var mostrarPuntosRecarga = document.getElementById('mostrarPuntosRecarga');

    if (!filtroProvincia) {
        console.error('ERROR: No se encontró filtroProvincia');
        return;
    }

    filtroProvincia.addEventListener('change', function() {
        console.log('✓ Cambió provincia a:', this.value);
        actualizarComboMunicipios();
        aplicarFiltros();
    });

    filtroMunicipio.addEventListener('change', function() {
        console.log('✓ Cambió municipio a:', this.value);
        aplicarFiltros();
    });
    
    filtroCombustible.addEventListener('change', function() {
        console.log('✓ Cambió combustible a:', this.value);
        aplicarFiltros();
    });
    
    filtroPotenciaRecarga.addEventListener('change', function() {
        console.log('✓ Cambió potencia a:', this.value);
        aplicarFiltros();
    });
    
    mostrarGasolineras.addEventListener('change', function() {
        console.log('✓ Cambió checkbox gasolineras a:', this.checked);
        aplicarFiltros();
    });
    
    mostrarPuntosRecarga.addEventListener('change', function() {
        console.log('✓ Cambió checkbox puntos recarga a:', this.checked);
        aplicarFiltros();
    });
    
    console.log('*** FILTROS CONFIGURADOS CORRECTAMENTE ***');
}

function actualizarComboMunicipios() {
    var provinciaSeleccionada = document.getElementById('filtroProvincia').value;
    var select = document.getElementById('filtroMunicipio');
    
    // Si está seleccionado "Todas", desactivar el combo de municipios
    if (provinciaSeleccionada === 'todas') {
        select.disabled = true;
        select.innerHTML = '<option value="todos">Selecciona primero una provincia</option>';
        return;
    }
    
    // Habilitar el combo
    select.disabled = false;
    
    var municipios = new Set();

    todasGasolineras.forEach(function(g) {
        if (g.Provincia === provinciaSeleccionada && g.Municipio) {
            municipios.add(g.Municipio);
        }
    });

    todosPuntosRecarga.forEach(function(p) {
        if (p.AddressInfo && p.AddressInfo.Town) {
            municipios.add(p.AddressInfo.Town);
        }
    });

    select.innerHTML = '<option value="todos">Todos</option>';
    
    Array.from(municipios).sort().forEach(function(municipio) {
        var option = document.createElement('option');
        option.value = municipio;
        option.textContent = municipio;
        select.appendChild(option);
    });
}

function aplicarFiltros() {
    console.log('=== APLICANDO FILTROS ===');
    
    var provinciaSelec = document.getElementById('filtroProvincia').value;
    var filtroMunicipioElement = document.getElementById('filtroMunicipio');
    var municipioSelec = filtroMunicipioElement.disabled ? 'todos' : filtroMunicipioElement.value;
    var combustibleSelec = document.getElementById('filtroCombustible').value;
    var potenciaSelec = document.getElementById('filtroPotenciaRecarga').value;

    var gasolinerasFiltradas = [];
    
    if (combustibleSelec !== 'ninguno') {
        gasolinerasFiltradas = todasGasolineras.filter(function(g) {
            var cumpleProvincia = provinciaSelec === 'todas' || g.Provincia === provinciaSelec;
            var cumpleMunicipio = municipioSelec === 'todos' || g.Municipio === municipioSelec;
            
            var cumpleCombustible = true;
            if (combustibleSelec === 'gasoleoA') {
                cumpleCombustible = g['Precio Gasoleo A'] && g['Precio Gasoleo A'] !== '';
            } else if (combustibleSelec === 'gasolina95') {
                cumpleCombustible = g['Precio Gasolina 95 E5'] && g['Precio Gasolina 95 E5'] !== '';
            } else if (combustibleSelec === 'gasolina98') {
                cumpleCombustible = g['Precio Gasolina 98 E5'] && g['Precio Gasolina 98 E5'] !== '';
            }

            return cumpleProvincia && cumpleMunicipio && cumpleCombustible;
        });
    }

    console.log('Gasolineras filtradas:', gasolinerasFiltradas.length);

    var puntosRecargaFiltrados = todosPuntosRecarga.filter(function(p) {
        if (!p.AddressInfo) return false;
        
        // Filtrar por provincia basándonos en la ubicación del punto
        var cumpleProvincia = true;
        if (provinciaSelec !== 'todas') {
            var town = p.AddressInfo.Town || '';
            // Mapear municipios conocidos a sus provincias
            var municipiosBizkaia = ['Bilbao', 'Getxo', 'Barakaldo'];
            var municipiosGipuzkoa = ['Donostia-San Sebastián', 'San Sebastián'];
            var municipiosAlava = ['Vitoria-Gasteiz'];
            
            if (provinciaSelec === 'BIZKAIA') {
                cumpleProvincia = municipiosBizkaia.some(function(m) { return town.includes(m); });
            } else if (provinciaSelec === 'GIPUZKOA') {
                cumpleProvincia = municipiosGipuzkoa.some(function(m) { return town.includes(m); });
            } else if (provinciaSelec === 'ARABA/ÁLAVA') {
                cumpleProvincia = municipiosAlava.some(function(m) { return town.includes(m); });
            }
        }
        
        var cumpleMunicipio = municipioSelec === 'todos' || p.AddressInfo.Town === municipioSelec;
        
        var cumplePotencia = true;
        if (potenciaSelec !== 'todas' && p.Connections) {
            var tieneRapida = p.Connections.some(function(c) {
                return c.PowerKW && c.PowerKW >= 50;
            });
            cumplePotencia = (potenciaSelec === 'rapida') ? tieneRapida : !tieneRapida;
        }

        return cumpleProvincia && cumpleMunicipio && cumplePotencia;
    });

    console.log('Puntos recarga filtrados:', puntosRecargaFiltrados.length);

    mostrarDatos(gasolinerasFiltradas, puntosRecargaFiltrados);
    actualizarContador(gasolinerasFiltradas.length, puntosRecargaFiltrados.length);
}

function mostrarDatos(gasolineras, puntosRecarga) {
    todosMarkers.forEach(function(marker) {
        marker.setMap(null);
    });
    todosMarkers = [];
    
    var bounds = new google.maps.LatLngBounds();
    var hayMarcadores = false;
    
    var combustibleSelec = document.getElementById('filtroCombustible').value;
    var mostrarGas = document.getElementById('mostrarGasolineras').checked;
    var mostrarRec = document.getElementById('mostrarPuntosRecarga').checked;

    if (mostrarGas && combustibleSelec !== 'ninguno') {
        gasolineras.forEach(function(gasolinera) {
            var lat = parseFloat(gasolinera.Latitud.replace(',', '.'));
            var lng = parseFloat(gasolinera['Longitud (WGS84)'].replace(',', '.'));

            if (!isNaN(lat) && !isNaN(lng)) {
                var position = new google.maps.LatLng(lat, lng);
                
                var marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    icon: "http://maps.google.com/mapfiles/ms/micons/gas.png",
                    title: gasolinera['Rótulo'] || 'Gasolinera'
                });

                todosMarkers.push(marker);
                bounds.extend(position);
                hayMarcadores = true;

                google.maps.event.addListener(marker, 'click', (function(m, g) {
                    return function() {
                        mostrarInfoGasolinera(m, g);
                    }
                })(marker, gasolinera));
            }
        });
    }

    if (mostrarRec) {
        puntosRecarga.forEach(function(punto) {
            if (punto.AddressInfo && punto.AddressInfo.Latitude && punto.AddressInfo.Longitude) {
                var position = new google.maps.LatLng(
                    punto.AddressInfo.Latitude,
                    punto.AddressInfo.Longitude
                );
                
                var marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    icon: "http://maps.google.com/mapfiles/ms/micons/green.png",
                    title: punto.AddressInfo.Title || 'Punto de recarga'
                });

                todosMarkers.push(marker);
                bounds.extend(position);
                hayMarcadores = true;

                google.maps.event.addListener(marker, 'click', (function(m, p) {
                    return function() {
                        mostrarInfoPuntoRecarga(m, p);
                    }
                })(marker, punto));
            }
        });
    }
    
    if (hayMarcadores) {
        map.fitBounds(bounds);
        if (gasolineras.length + puntosRecarga.length === 1) {
            var listener = google.maps.event.addListener(map, "idle", function() {
                if (map.getZoom() > 15) map.setZoom(15);
                google.maps.event.removeListener(listener);
            });
        }
    }
    // Si no hay marcadores, mantener el zoom actual (no hacer nada)
}

function mostrarInfoGasolinera(marker, gasolinera) {
    var precioGasoleoA = gasolinera['Precio Gasoleo A'] || 'N/D';
    var precioGasolina95 = gasolinera['Precio Gasolina 95 E5'] || 'N/D';
    var precioGasolina98 = gasolinera['Precio Gasolina 98 E5'] || 'N/D';
    
    if (precioGasoleoA !== 'N/D') precioGasoleoA = precioGasoleoA.replace(',', '.');
    if (precioGasolina95 !== 'N/D') precioGasolina95 = precioGasolina95.replace(',', '.');
    if (precioGasolina98 !== 'N/D') precioGasolina98 = precioGasolina98.replace(',', '.');

    // Buscar la fecha en diferentes campos posibles
    var fechaActualizacion = '';
    var fecha = gasolinera['Fecha'] || gasolinera['Precio Gasoleo A Fecha'] || gasolinera['Fecha Actualización'];
    
    // Debug: mostrar todos los campos disponibles en consola (solo la primera vez)
    if (!window.camposMostrados) {
        console.log('Campos disponibles en gasolinera:', Object.keys(gasolinera));
        window.camposMostrados = true;
    }
    
    if (fecha) {
        fechaActualizacion = '<p style="margin: 5px 0; font-size: 11px; color: #888;"><strong>📅 Actualizado:</strong> ' + fecha + '</p>';
    }

    var contentString = '<div style="max-width: 300px;">' +
        '<h2 style="margin: 5px 0;">⛽ ' + (gasolinera['Rótulo'] || 'Sin nombre') + '</h2>' +
        '<div>' +
        '<p style="margin: 5px 0;"><strong>Dirección:</strong> ' + gasolinera['Dirección'] + '</p>' +
        '<p style="margin: 5px 0;"><strong>Municipio:</strong> ' + gasolinera.Municipio + '</p>' +
        '<p style="margin: 5px 0;"><strong>Provincia:</strong> ' + gasolinera.Provincia + '</p>' +
        '<p style="margin: 5px 0;"><strong>Horario:</strong> ' + (gasolinera.Horario || 'N/D') + '</p>' +
        '<hr style="margin: 10px 0;">' +
        '<p style="margin: 5px 0;"><strong>Gasóleo A:</strong> ' + precioGasoleoA + ' €/L</p>' +
        '<p style="margin: 5px 0;"><strong>Gasolina 95:</strong> ' + precioGasolina95 + ' €/L</p>' +
        '<p style="margin: 5px 0;"><strong>Gasolina 98:</strong> ' + precioGasolina98 + ' €/L</p>' +
        fechaActualizacion +
        '</div></div>';

    infowindow.setContent(contentString);
    infowindow.open(map, marker);
}

function mostrarInfoPuntoRecarga(marker, punto) {
    var operador = punto.OperatorInfo ? punto.OperatorInfo.Title : 'Desconocido';
    var direccion = punto.AddressInfo.AddressLine1 || 'N/D';
    var municipio = punto.AddressInfo.Town || 'N/D';
    var acceso = punto.UsageType ? punto.UsageType.Title : 'N/D';
    
    var conectores = '';
    if (punto.Connections && punto.Connections.length > 0) {
        conectores = '<p style="margin: 5px 0;"><strong>Conectores:</strong></p><ul style="margin: 5px 0; padding-left: 20px;">';
        punto.Connections.forEach(function(conn) {
            var tipo = conn.ConnectionType ? conn.ConnectionType.Title : 'Desconocido';
            var potencia = conn.PowerKW ? conn.PowerKW + ' kW' : 'N/D';
            conectores += '<li>' + tipo + ' (' + potencia + ')</li>';
        });
        conectores += '</ul>';
    }

    var contentString = '<div style="max-width: 320px;">' +
        '<h2 style="margin: 5px 0;">⚡ ' + (punto.AddressInfo.Title || 'Punto de recarga') + '</h2>' +
        '<div>' +
        '<p style="margin: 5px 0;"><strong>Operador:</strong> ' + operador + '</p>' +
        '<p style="margin: 5px 0;"><strong>Dirección:</strong> ' + direccion + '</p>' +
        '<p style="margin: 5px 0;"><strong>Municipio:</strong> ' + municipio + '</p>' +
        '<p style="margin: 5px 0;"><strong>Acceso:</strong> ' + acceso + '</p>' +
        conectores + '</div></div>';

    infowindow.setContent(contentString);
    infowindow.open(map, marker);
}

function actualizarContador(numGasolineras, numPuntosRecarga) {
    var contador = document.getElementById('contador');
    var combustibleSelec = document.getElementById('filtroCombustible').value;
    var mostrarGas = document.getElementById('mostrarGasolineras').checked;
    var mostrarRec = document.getElementById('mostrarPuntosRecarga').checked;
    
    var texto = '';
    var partes = [];
    var totalResultados = 0;
    
    // Contar qué se está mostrando realmente
    if (mostrarGas && combustibleSelec !== 'ninguno') {
        partes.push(numGasolineras + ' gasolinera' + (numGasolineras !== 1 ? 's' : ''));
        totalResultados += numGasolineras;
    }
    
    if (mostrarRec) {
        partes.push(numPuntosRecarga + ' punto' + (numPuntosRecarga !== 1 ? 's' : '') + ' de recarga');
        totalResultados += numPuntosRecarga;
    }
    
    // Verificar si no hay resultados
    if (totalResultados === 0) {
        if (!mostrarGas && !mostrarRec) {
            texto = '⚠️ No se muestran resultados - Marca al menos una opción';
        } else {
            texto = '⚠️ No hay estaciones ni puntos de recarga que cumplan los criterios de búsqueda';
        }
        contador.className = 'sin-resultados';
    } else {
        texto = 'Mostrando: ' + partes.join(' y ');
        contador.className = '';
    }
    
    contador.textContent = texto;
}