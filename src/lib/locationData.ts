export interface Provincia {
    id: string;
    name: string;
}

export interface Canton {
    id: string;
    name: string;
    provinciaId: string;
}

export interface Parroquia {
    id: string;
    name: string;
    cantonId: string;
}

// Data source provided by user
const RAW_DATA = [
    {
        provincia: "SUCUMBÍOS",
        cantones: [
            { nombre: "LAGO AGRIO", parroquias: ["Nueva Loja", "Dureno", "General Farfán", "Pacayacu", "Santa Cecilia", "Elorza", "Santa Paula"] },
            { nombre: "GONZALO PIZARRO", parroquias: ["Lumbaqui", "Puerto Libre", "Reventador", "Gonzalo Pizarro"] },
            { nombre: "PUTUMAYO", parroquias: ["Puerto El Carmen de Putumayo", "Palma Roja", "Puerto Bolívar (Puerto Montúfar)", "Puerto Rodríguez", "Santa Elena"] },
            { nombre: "SHUSHUFINDI", parroquias: ["Shushufindi", "Limoncocha", "Pañacocha", "San Roque", "San Pedro de los Cofanes", "Siete de Julio"] },
            { nombre: "CASSCALES", parroquias: ["El Dorado de Casiscales", "Santa Rosa de Sucumbíos", "Sevilla"] },
            { nombre: "CUYABENO", parroquias: ["Tarapoa", "Cuyabeno", "Aguas Negras"] },
            { nombre: "SUCUMBÍOS", parroquias: ["La Bonita", "El Playón de San Francisco", "La Sofía", "Rosa Florida", "Santa Bárbara"] }
        ]
    },
    {
        provincia: "ORELLANA",
        cantones: [
            { nombre: "ORELLANA", parroquias: ["Puerto Francisco de Orellana", "Dayuma", "Taracoa", "Alejandro Labaka", "El Dorado", "El Edén", "García Moreno", "Inés Arango", "La Belleza", "Nuevo Paraíso", "San José de Guayusa", "San Luis de Armenia"] },
            { nombre: "AGUARICO", parroquias: ["Nuevo Rocafuerte", "Tiputini", "Capitán Augusto Rivadeneira", "Cononaco", "Santa María de Huiririma", "Yuralpa"] },
            { nombre: "LA JOYA DE LOS SACHAS", parroquias: ["La Joya de los Sachas", "Enokanqui", "Lago San Pedro", "Rumipamba", "San Carlos", "San Sebastián del Coca", "Unión Milagreña"] },
            { nombre: "LORETO", parroquias: ["Loreto", "Avila", "Puerto Murialdo", "San José de Dahuano", "San José de Payamino"] }
        ]
    },
    {
        provincia: "NAPO",
        cantones: [
            { nombre: "TENA", parroquias: ["Tena", "Ahuano", "Chonta Punta", "Pano", "Puerto Misahuallí", "Puerto Napo", "Talag", "Muyuna"] },
            { nombre: "ARCHIDONA", parroquias: ["Archidona", "Cotundo", "San Pablo de Ushpayacu", "Hatun Sumaku"] },
            { nombre: "EL CHACO", parroquias: ["El Chaco", "Gonzalo Díaz de Pineda", "Linares", "Oyacachi", "Santa Rosa", "Sardinas"] },
            { nombre: "QUIJOS", parroquias: ["Baeza", "Cosanga", "Cuyuja", "Papallacta", "San Francisco de Borja", "Sumaco"] },
            { nombre: "CARLOS JULIO AROSEMENA TOLA", parroquias: ["Carlos Julio Arosemena Tola"] }
        ]
    },
    {
        provincia: "PASTAZA",
        cantones: [
            { nombre: "PASTAZA", parroquias: ["Puyo", "Canelos", "Diez de Agosto", "Fátima", "Montalvo", "Pomona", "Río Corriente", "Río Tigre", "Sarayacu", "Simón Bolívar", "Tarqui", "Teniente Hugo Ortiz", "Veracruz"] },
            { nombre: "MERA", parroquias: ["Mera", "Madre Tierra", "Shell"] },
            { nombre: "SANTA CLARA", parroquias: ["Santa Clara", "San José"] },
            { nombre: "ARAJUNO", parroquias: ["Arajuno", "Curaray"] }
        ]
    },
    {
        provincia: "MORONA SANTIAGO",
        cantones: [
            { nombre: "MORONA", parroquias: ["Macas", "Alshi", "General Proaño", "Sevilla Don Bosco", "Sinaí", "Zuñac", "Cuchaentza", "San Isidro", "Río Blanco"] },
            { nombre: "GUALAQUIZA", parroquias: ["Gualaquiza", "Amazonas", "Bermejos", "Chigüinda", "El Rosario", "El Ideal", "Nueva Tarqui", "San Miguel de Cuyes", "Bomboiza"] },
            { nombre: "LIMÓN INDANZA", parroquias: ["General Plaza", "Indanza", "San Antonio", "Santa Susana de Chiviaza", "Yunganza", "San Miguel de Conchay", "Santa Marianita de Jesús"] },
            { nombre: "PALORA", parroquias: ["Palora", "Sangay", "16 de Agosto", "Arapicos", "Cumandá"] },
            { nombre: "SANTIAGO", parroquias: ["Santiago de Méndez", "Copal", "Chupianza", "Patuca", "San Luis del Acho", "Tayuza", "San Francisco de Chinimbimi"] },
            { nombre: "SUCÚA", parroquias: ["Sucúa", "Asunción", "Huambi", "Santa Marianita de Jesús"] },
            { nombre: "HUAMBOYA", parroquias: ["Huamboya", "Chiguaza"] },
            { nombre: "SAN JUAN BOSCO", parroquias: ["San Juan Bosco", "Pan de Azúcar", "San Carlos de Limón", "San Jacinto de Wakambeis", "Santiago de Pananza"] },
            { nombre: "TAISHA", parroquias: ["Taisha", "Huasaga", "Macuma", "Tuutinentza", "Pumpuentsa"] },
            { nombre: "LOGROÑO", parroquias: ["Logroño", "Yaupi", "Shimpis"] },
            { nombre: "PABLO SEXTO", parroquias: ["Pablo Sexto"] },
            { nombre: "TIWINTZA", parroquias: ["Santiago", "San José de Morona"] }
        ]
    },
    {
        provincia: "ZAMORA CHINCHIPE",
        cantones: [
            { nombre: "ZAMORA", parroquias: ["Zamora", "Cumbaratza", "Guadalupe", "Imbana", "Sabanilla", "Timbara", "San Carlos de las Minas"] },
            { nombre: "CHINCHIPE", parroquias: ["Zumba", "Chito", "El Chorro", "La Chonta", "Pucapamba", "San Andrés"] },
            { nombre: "NANGARITZA", parroquias: ["Guayzimi", "Zurmi", "Nuevo Paraíso"] },
            { nombre: "YACUAMBI", parroquias: ["28 de Mayo", "La Paz", "Tutupali"] },
            { nombre: "YANTZAZA", parroquias: ["Yantzaza", "Chicaña", "Los Encuentros"] },
            { nombre: "EL PANGUI", parroquias: ["El Pangui", "El Guismi", "Pachicutza", "Tundayme"] },
            { nombre: "CENTINELA DEL CÓNDOR", parroquias: ["Zumbi", "Panguintza"] },
            { nombre: "PALANDA", parroquias: ["Palanda", "El Porvenir del Carmen", "San Francisco del Vergel", "Valladolid", "La Canela"] },
            { nombre: "PAQUISHA", parroquias: ["Paquisha", "Bellavista", "Nuevo Quito"] }
        ]
    },
    {
        provincia: "GALÁPAGOS",
        cantones: [
            { nombre: "SAN CRISTÓBAL", parroquias: ["Puerto Baquerizo Moreno", "El Progreso", "Isla Santa María (Floreana)"] },
            { nombre: "ISABELA", parroquias: ["Puerto Villamil", "Tomás de Berlanga"] },
            { nombre: "SANTA CRUZ", parroquias: ["Puerto Ayora", "Bellavista", "Santa Rosa"] }
        ]
    },
    {
        provincia: "CARCHI",
        cantones: [
            { nombre: "TULCÁN", parroquias: ["Tulcán", "González Suárez", "Anzoátegui", "Bolívar", "Julio Andrade", "El Carmelo", "Maldonado", "Pioter", "Santa Martha de Cuba", "Tufiño", "Urbina", "Chical"] },
            { nombre: "BOLÍVAR", parroquias: ["Bolívar", "García Moreno", "Los Andes", "Monte Olivo", "San Vicente de Pusir", "San Rafael"] },
            { nombre: "ESPEJO", parroquias: ["El Ángel", "27 de Septiembre", "El Goaltal", "La Libertad", "San Isidro"] },
            { nombre: "MIRA", parroquias: ["Mira", "Concepción", "Juan Montalvo", "La Zarza"] },
            { nombre: "MONTÚFAR", parroquias: ["San Gabriel", "La Paz", "Piartal", "Cristóbal Colón", "Chitán de Navarrete", "Fernández Salvador"] },
            { nombre: "SAN PEDRO DE HUACA", parroquias: ["Huaca", "Mariscal Sucre"] }
        ]
    },
    {
        provincia: "IMBABURA",
        cantones: [
            { nombre: "IBARRA", parroquias: ["Caranqui", "Guayaquil de Alpachaca", "Sagrado Corazón de Jesús", "San Francisco", "Priorato", "Ambuquí", "Angochagua", "Carolina", "La Esperanza", "Lita", "Salinas", "San Antonio"] },
            { nombre: "ANTONIO ANTE", parroquias: ["Atuntaqui", "Andrade Marín", "Imbaya", "San Roque", "Natabuela", "Chaltura"] },
            { nombre: "COTACACHI", parroquias: ["Sagrario", "San Francisco", "Imantag", "Quiroga", "Cuellaje", "Apuela", "García Moreno", "Peñaherrera", "Vacas Galindo"] },
            { nombre: "OTAVALO", parroquias: ["Jordán", "San Luis", "Dr. Miguel Egas Cabezas", "Eugenia Espejo", "González Suárez", "Pataquí", "San José de Quichinche", "San Juan de Ilumán", "San Pablo", "San Rafael", "Selva Alegre"] },
            { nombre: "PIMAMPIRO", parroquias: ["Pimampiro", "Chugá", "Mariano Acosta", "San Francisco de Sigsipamba"] },
            { nombre: "URCUQUÍ", parroquias: ["Urcuquí", "Cahuasquí", "La Merced de Buenos Aires", "San Blas", "Tumbabiro"] }
        ]
    },
    {
        provincia: "PICHINCHA",
        cantones: [
            { nombre: "QUITO", parroquias: ["Belisario Quevedo", "Carcelén", "Centro Histórico", "Chilibulo", "Chillogallo", "Chimbacalle", "Cochapamba", "Comité del Pueblo", "Cotocollao", "El Condado", "Guamaní", "Iñaquito", "Itchimbía", "Jipijapa", "Kennedy", "La Argelia", "La Concepción", "La Ecuatoriana", "La Ferroviaria", "La Libertad", "La Magdalena", "La Mena", "Mariscal Sucre", "Ponceano", "Puengasí", "Quitumbe", "San Bartolo", "San Juan", "Solanda", "Turubamba", "Alangasí", "Amaguaña", "Atahualpa", "Calacalí", "Calderón", "Conocoto", "Cumbayá", "El Quinche", "Gualea", "Guangopolo", "Guayllabamba", "Lloa", "Nanegal", "Nanegalito", "Nayón", "Nono", "Pacto", "Perucho", "Pifo", "Pintag", "Pomasqui", "Puéllaro", "Puembo", "San Antonio", "San José de Minas", "Tababela", "Tumbaco", "Yaruquí", "Zámbiza"] },
            { nombre: "CAYAMBE", parroquias: ["Cayambe", "Ascázubi", "Cangahua", "Olmedo", "Otón", "Santa Rosa de Cusubamba", "San José de Ayora"] },
            { nombre: "MEJÍA", parroquias: ["Machachi", "Alóag", "Aloasí", "Cutuglagua", "El Chaupi", "Manuel Cornejo Astorga", "Tambillo", "Uyumbicho"] },
            { nombre: "PEDRO MONCAYO", parroquias: ["Tabacundo", "La Esperanza", "Malchinguí", "Tocachi", "Tupigachi"] },
            { nombre: "RUMIÑAHUI", parroquias: ["Sangolquí", "San Pedro de Taboada", "San Rafael", "Cotogchoa", "Rumipamba"] },
            { nombre: "SAN MIGUEL DE LOS BANCOS", parroquias: ["San Miguel de los Bancos", "Mindo"] },
            { nombre: "PEDRO VICENTE MALDONADO", parroquias: ["Pedro Vicente Maldonado"] },
            { nombre: "PUERTO QUITO", parroquias: ["Puerto Quito"] }
        ]
    },
    {
        provincia: "COTOPAXI",
        cantones: [
            { nombre: "LATACUNGA", parroquias: ["Eloy Alfaro", "Ignacio Flores", "Juan Montalvo", "La Matriz", "San Buenaventura", "Alaquez", "Belisario Quevedo", "Guaytacama", "Joseguango Bajo", "Mulaló", "11 de Noviembre", "Poaló", "San Juan de Pastocalle", "Tanicuchí", "Toacaso"] },
            { nombre: "LA MANÁ", parroquias: ["La Maná", "El Carmen", "El Triunfo", "Guasaganda", "Pucayacu"] },
            { nombre: "PANGUA", parroquias: ["El Corazón", "Moraspungo", "Pinllopata", "Ramón Campaña"] },
            { nombre: "PUJILÍ", parroquias: ["Pujilí", "Angamarca", "Guangaje", "La Victoria", "Pilaló", "Tingo", "Zumbahua"] },
            { nombre: "SALCEDO", parroquias: ["San Miguel", "Antonio José Holguín", "Cusubamba", "Mulalillo", "Mulliquindil", "Panzaleo"] },
            { nombre: "SAQUISILÍ", parroquias: ["Saquisilí", "Canchagua", "Chantilín", "Cochapamba"] },
            { nombre: "SIGCHOS", parroquias: ["Sigchos", "Chugchilán", "Isinliví", "Las Pampas", "Palo Quemado"] }
        ]
    },
    {
        provincia: "TUNGURAHUA",
        cantones: [
            { nombre: "AMBATO", parroquias: ["Atocha-Ficoa", "Celiano Monge", "Huachi Chico", "Huachi Loreto", "La Matriz", "La Merced", "La Península", "Pishilata", "San Francisco", "Ambatillo", "Atahualpa", "Augusto Martínez", "Constantino Fernández", "Huachi Grande", "Izamba", "Juan Benigno Vela", "Montalvo", "Pasa", "Picaihua", "Pilahuín", "Quisapincha", "San Bartolomé", "San Fernando", "Santa Rosa", "Totoras"] },
            { nombre: "BAÑOS", parroquias: ["Baños de Agua Santa", "Lligua", "Río Negro", "Río Verde", "Ulba"] },
            { nombre: "CEVALLOS", parroquias: ["Cevallos"] },
            { nombre: "MOCHA", parroquias: ["Mocha", "Pinguilí"] },
            { nombre: "PATATE", parroquias: ["Patate", "El Triunfo", "Los Andes", "Sucre"] },
            { nombre: "QUERO", parroquias: ["Quero", "Rumipamba", "Yanayacu"] },
            { nombre: "PELILEO", parroquias: ["Pelileo", "Pelileo Grande", "Benítez", "Bolívar", "Cotaló", "Chiquicha", "El Rosario", "García Moreno", "Huambaló", "Salasaca"] },
            { nombre: "PÍLLARO", parroquias: ["Píllaro", "Ciudad Nueva", "Baquerizo Moreno", "Emilio María Terán", "Marcos Espinel", "Presidente Urbina", "San Andrés", "San José de Poaló", "San Miguelito"] },
            { nombre: "TISALEO", parroquias: ["Tisaleo", "Quinchicoto"] }
        ]
    },
    {
        provincia: "CHIMBORAZO",
        cantones: [
            { nombre: "RIOBAMBA", parroquias: ["Lizarzaburu", "Maldonado", "Velasco", "Veloz", "Yaruquíes", "Cacha", "Calpi", "Cubijíes", "Guanando", "Licán", "Licto", "Pungala", "Punit", "Químiag", "San Juan", "San Luis"] },
            { nombre: "ALAUSÍ", parroquias: ["Alausí", "Achupallas", "Guasuntos", "Huigra", "Multitud", "Pistishi", "Pumallacta", "Sevilla", "Sibambe", "Tixán"] },
            { nombre: "COLTA", parroquias: ["Cajabamba", "Sicalpa", "Cañi", "Columbe", "Juan de Velasco", "Santiago de Quito"] },
            { nombre: "CHAMBO", parroquias: ["Chambo"] },
            { nombre: "CHUNCHI", parroquias: ["Chunchi", "Capzol", "Compud", "Gonzol", "Llagos"] },
            { nombre: "GUAMOTE", parroquias: ["Guamote", "Cebadas", "Palmira"] },
            { nombre: "GUANO", parroquias: ["Guano", "El Rosario", "Ilapo", "La Providencia", "San Andrés", "San Gerardo de Pacaicaguán", "San Isidro de Patulú", "San José del Chazo", "Santa Fe de Galán", "Valparaíso"] },
            { nombre: "PALLATANGA", parroquias: ["Pallatanga"] },
            { nombre: "PENIPE", parroquias: ["Penipe", "El Altar", "Matus", "Puela", "San Antonio de Bayushig", "La Candelaria", "Bilbao"] },
            { nombre: "CUMANDÁ", parroquias: ["Cumandá"] }
        ]
    },
    {
        provincia: "BOLÍVAR",
        cantones: [
            { nombre: "GUARANDA", parroquias: ["Ángel Polibio Chaves", "Gabriel Ignacio Veintimilla", "Guanujo", "Facundo Vela", "Julio E. Moreno", "Salinas", "San Lorenzo", "San Simón", "Santa Fé", "Simiatug"] },
            { nombre: "CHILLANES", parroquias: ["Chillanes", "San José del Tambo"] },
            { nombre: "CHIMBO", parroquias: ["San José de Chimbo", "Asunción", "Magdalena", "San Sebastián", "Telimbela"] },
            { nombre: "ECHEANDÍA", parroquias: ["Echeandía"] },
            { nombre: "SAN MIGUEL", parroquias: ["San Miguel", "Balsapamba", "Bilován", "Régulo de Mora", "San Pablo de Atenas", "Santiago", "San Vicente"] },
            { nombre: "CALUMA", parroquias: ["Caluma"] },
            { nombre: "LAS NAVES", parroquias: ["Las Naves"] }
        ]
    },
    {
        provincia: "CAÑAR",
        cantones: [
            { nombre: "AZOGUES", parroquias: ["Azogues", "Aurelio Bayas", "Coajitambo", "Guapán", "Luis Cordero", "Pindilig", "Rivera", "San Marcos", "Taday"] },
            { nombre: "BIBLIÁN", parroquias: ["Biblián", "Nazón", "Sagal", "Turupamba"] },
            { nombre: "CAÑAR", parroquias: ["Cañar", "Chontamarca", "Chorocopte", "General Morales", "Gualleturo", "Honorato Vázquez", "Ingapirca", "Juncal", "San Antonio", "Zhud"] },
            { nombre: "LA TRONCAL", parroquias: ["La Troncal", "Manuel J. Calle", "Pancho Negro"] },
            { nombre: "EL TAMBO", parroquias: ["El Tambo"] },
            { nombre: "DÉLEG", parroquias: ["Déleg", "Solano"] },
            { nombre: "SUSCAL", parroquias: ["Suscal"] }
        ]
    },
    {
        provincia: "AZUAY",
        cantones: [
            { nombre: "CUENCA", parroquias: ["Bellavista", "Cañaribamba", "El Batán", "El Sagrario", "El Vecino", "Gil Ramírez Dávalos", "Hermano Miguel", "Huaynacápac", "Machángara", "Monay", "San Blas", "San Sebastián", "Sucre", "Totoracocha", "Yanuncay", "Baños", "Cumbe", "Chaucha", "Checa", "Chiquintad", "Llacao", "Molleturo", "Nulti", "Octavio Cordero Palacios", "Paccha", "Quingeo", "Ricaurte", "San Joaquín", "Santa Ana", "Sayausí", "Sidcay", "Sinincay", "Tarqui", "Turi", "Valle", "Victoria del Portete"] },
            { nombre: "GUALACEO", parroquias: ["Gualaceo", "Daniel Córdova Toral", "Jadán", "Mariano Moreno", "Remigio Crespo Toral", "San Juan", "Zhidmad", "Luis Cordero Vega"] },
            { nombre: "PAUTE", parroquias: ["Paute", "Bulán", "Chicán", "Dug Dug", "El Cabo", "Guarainac", "San Cristóbal", "Tomebamba"] },
            { nombre: "SIGSIG", parroquias: ["Sigsig", "Cuchil", "Gima", "Guel", "Ludo", "San Bartolomé", "San José de Raranga"] },
            { nombre: "SANTA ISABEL", parroquias: ["Santa Isabel", "Abdón Calderón"] },
            { nombre: "CAMILO PONCE ENRÍQUEZ", parroquias: ["Camilo Ponce Enríquez", "El Carmen de Pijilí"] },
            { nombre: "CHORDELEG", parroquias: ["Chordeleg", "Principal", "La Unión", "Luis Galarza Orellana", "San Martín de Puzhío"] },
            { nombre: "EL PAN", parroquias: ["El Pan", "San Vicente"] },
            { nombre: "GIRÓN", parroquias: ["Girón", "Asunción", "San Gerardo"] },
            { nombre: "GUACHAPALA", parroquias: ["Guachapala"] },
            { nombre: "NABÓN", parroquias: ["Nabón", "Cozhapata", "El Progreso", "Las Nieves"] },
            { nombre: "OÑA", parroquias: ["San Felipe de Oña", "Susudel"] },
            { nombre: "PUCARÁ", parroquias: ["Pucará", "San Rafael del Zhar"] },
            { nombre: "SAN FERNANDO", parroquias: ["San Fernando", "Chumblín"] },
            { nombre: "SEVILLA DE ORO", parroquias: ["Sevilla de Oro", "Amaluza", "Palmas"] }
        ]
    },
    {
        provincia: "LOJA",
        cantones: [
            { nombre: "LOJA", parroquias: ["El Sagrario", "San Sebastián", "Sucre", "Valle", "Carigán", "Punzara", "Chantaco", "Chuquiribamba", "El Cisne", "Gualel", "Jimbilla", "Malacatos", "Quinara", "San Lucas", "San Pedro de Vilcabamba", "Santiago", "Taquil", "Vilcabamba", "Yangana"] },
            { nombre: "CALVAS", parroquias: ["Cariamanga", "Chile", "San Vicente", "Colaisaca", "El Lucero", "Sanguillín"] },
            { nombre: "CATAMAYO", parroquias: ["Catamayo", "San José", "El Tambo", "Guayquichuma", "San Pedro de la Bendita", "Zambi"] },
            { nombre: "CELICA", parroquias: ["Celica", "Cruzpamba", "Pozul", "Sabanilla", "Teniente Maximiliano Rodríguez"] },
            { nombre: "CHAGUARPAMBA", parroquias: ["Chaguarpamba", "Buenavista", "El Rosario", "Santa Rufina", "Amarillos"] },
            { nombre: "ESPÍNDOLA", parroquias: ["Amaluza", "Bellavista", "Jimbura", "Santa Teresita", "27 de Abril", "El Ingenio", "El Airo"] },
            { nombre: "GONZANAMÁ", parroquias: ["Gonzanamá", "Changaimina", "Nambacola", "Purunuma", "Sacapalca"] },
            { nombre: "MACARÁ", parroquias: ["Macará", "Larama", "La Victoria", "Sabiango"] },
            { nombre: "PALTAS", parroquias: ["Catacocha", "Lourdes", "Cangonamá", "Casanga", "Guachanamá", "Lauro Guerrero", "Orianga", "San Antonio", "Yamana"] },
            { nombre: "PUYANGO", parroquias: ["Alamor", "Ciano", "El Limo", "Mercadillo", "Vicentino", "El Arenal"] },
            { nombre: "SARAGURO", parroquias: ["Saraguro", "Celén", "El Tablón", "Lluzhapa", "Manu", "Paraíso de Celén", "San Antonio de Qumbe", "San Pablo de Tenta", "San Sebastián de Yuluc", "Selva Alegre", "Sumaypamba"] },
            { nombre: "SOZORANGA", parroquias: ["Sozoranga", "Nueva Fátima", "Tacamoros"] },
            { nombre: "ZAPOTILLO", parroquias: ["Zapotillo", "Cazaderos", "Garzareal", "Limones", "Paletillas", "Bolaspamba", "Mangahurco"] },
            { nombre: "PINDAL", parroquias: ["Pindal", "Chaquisca", "12 de Diciembre", "Milagros"] },
            { nombre: "QUILANGA", parroquias: ["Quilanga", "Fundochamba", "San Antonio de las Aradas"] },
            { nombre: "OLMEDO", parroquias: ["Olmedo", "La Tingue"] }
        ]
    },
    {
        provincia: "GUAYAS",
        cantones: [
            { nombre: "GUAYAQUIL", parroquias: ["Ayacucho", "Bolívar", "Carbo", "Febres Cordero", "García Moreno", "Letamendi", "Nueve de Octubre", "Olmedo", "Roca", "Rocafuerte", "Sucre", "Tarqui", "Urdaneta", "Ximena", "Pascuales", "Juan Gómez Rendón (Progreso)", "Posorja", "Puná", "Tenguel", "El Morro"] },
            { nombre: "ALFREDO BAQUERIZO MORENO (JUJÁN)", parroquias: ["Alfredo Baquerizo Moreno"] },
            { nombre: "BALAO", parroquias: ["Balao"] },
            { nombre: "BALZAR", parroquias: ["Balzar"] },
            { nombre: "COLIMES", parroquias: ["Colimes", "San Jacinto"] },
            { nombre: "DAULE", parroquias: ["Daule", "La Aurora", "Banife", "Emiliano Caicedo", "Magro", "Santa Clara", "Vicente Piedrahita", "Limonal", "Los Lojas", "Juan Bautista Aguirre"] },
            { nombre: "DURÁN", parroquias: ["Eloy Alfaro", "El Recreo"] },
            { nombre: "EL EMPALME", parroquias: ["Velasco Ibarra", "Guayas", "El Rosario"] },
            { nombre: "EL TRIUNFO", parroquias: ["El Triunfo"] },
            { nombre: "MILAGRO", parroquias: ["Milagro", "Chobo", "Mariscal Sucre", "Roberto Astudillo"] },
            { nombre: "NARANJAL", parroquias: ["Naranjal", "Jesús María", "San Carlos", "Santa Rosa de Flandes", "Taura"] },
            { nombre: "NARANJITO", parroquias: ["Naranjito"] },
            { nombre: "PALESTINA", parroquias: ["Palestina"] },
            { nombre: "PEDRO CARBO", parroquias: ["Pedro Carbo", "Valle de la Virgen", "Sabanilla"] },
            { nombre: "SAMBORONDÓN", parroquias: ["Samborondón", "Tarifa", "La Puntilla"] },
            { nombre: "SANTA LUCÍA", parroquias: ["Santa Lucia"] },
            { nombre: "SALITRE", parroquias: ["El Salitre", "General Vernaza", "La Victoria", "Junquillal"] },
            { nombre: "SAN JACINTO DE YAGUACHI", parroquias: ["Yaguachi Nuevo", "Virgen de Fátima", "Pedro J. Montero", "Yaguachi Viejo"] },
            { nombre: "PLAYAS", parroquias: ["General Villamil (Playas)"] },
            { nombre: "SIMÓN BOLÍVAR", parroquias: ["Simón Bolívar", "Lorenzo de Garaicoa"] },
            { nombre: "CORONEL MARCELINO MARIDUEÑA", parroquias: ["Coronel Marcelino MaridUEÑA"] },
            { nombre: "LOMAS DE SARGENTILLO", parroquias: ["Lomas de Sargentillo"] },
            { nombre: "NOBOL", parroquias: ["Narcisa de Jesús"] },
            { nombre: "GENERAL ANTONIO ELIZALDE (BUCAY)", parroquias: ["General Antonio Elizalde"] },
            { nombre: "ISIDRO AYORA", parroquias: ["Isidro Ayora"] }
        ]
    },
    {
        provincia: "MANABÍ",
        cantones: [
            { nombre: "PORTOVIEJO", parroquias: ["Portoviejo", "12 de Marzo", "Colón", "Picoazá", "San Pablo", "Andrés de Vera", "Francisco Pacheco", "18 de Octubre", "Simón Bolívar", "Abdón Calderón", "Alhajuela", "Crucita", "Pueblo Nuevo", "Riochico", "San Plácido", "Chirijos"] },
            { nombre: "MANTA", parroquias: ["Manta", "San Mateo", "Tarqui", "Los Esteros", "Eloy Alfaro", "San Lorenzo", "Santa Marianita"] },
            { nombre: "CHONE", parroquias: ["Chone", "Santa Rita", "Boyacá", "Canuto", "Convento", "Chibunga", "Eloy Alfaro", "Ricaurte", "San Antonio"] },
            { nombre: "BAHÍA DE CARÁQUEZ", parroquias: ["Bahía de Caráquez", "Leonidas Plaza", "Charapotó", "San Isidro"] },
            { nombre: "JIPIJAPA", parroquias: ["Jipijapa", "América", "El Anegado", "Julcuy", "La Unión", "Machalilla", "Membrillal", "Puerto de Cayo", "Pedro Pablo Gómez"] },
            { nombre: "MONTECRISTI", parroquias: ["Montecristi", "Aníbal San Andrés", "Colorado", "General Eloy Alfaro", "Leonidas Proaño", "La Pila"] },
            { nombre: "PAJÁN", parroquias: ["Paján", "Campozano", "Cascol", "Guale", "Lascano"] },
            { nombre: "ROCAFUERTE", parroquias: ["Rocafuerte"] },
            { nombre: "SANTA ANA", parroquias: ["Santa Ana", "Lodana", "Ayacucho", "Honorato Vásquez", "La Unión"] },
            { nombre: "TOSAGUA", parroquias: ["Tosagua", "Bachillero", "Angel Pedro Giler"] },
            { nombre: "24 DE MAYO", parroquias: ["Sucre", "Bellavista", "Noboa", "Sixto Durán Ballén"] },
            { nombre: "PEDERNALES", parroquias: ["Pedernales", "Cojimíes", "10 de Agosto", "Atahualpa"] },
            { nombre: "OLMEDO", parroquias: ["Olmedo"] },
            { nombre: "PUERTO LÓPEZ", parroquias: ["Puerto López", "Machalilla", "Salango"] },
            { nombre: "JAMA", parroquias: ["Jama"] },
            { nombre: "JARAMIJÓ", parroquias: ["Jaramijó"] },
            { nombre: "FLAVIO ALFARO", parroquias: ["Flavio Alfaro", "Zapallo", "Novillo"] },
            { nombre: "EL CARMEN", parroquias: ["El Carmen", "4 de Diciembre", "Wilfrido Loor Moreira", "San Pedro de Suma"] }
        ]
    },
    {
        provincia: "LOS RÍOS",
        cantones: [
            { nombre: "BABAHOYO", parroquias: ["Babahoyo", "Barreiro", "El Salto", "Clemente Baquerizo", "Caracol", "Febres Cordero", "Pimocha", "La Unión"] },
            { nombre: "QUEVEDO", parroquias: ["Quevedo", "San Camilo", "San Cristóbal", "Venus del Río Quevedo", "Nicolás Infante Díaz", "Guayacán", "Siete de Octubre", "24 de Mayo", "Viva Alfaro", "Esperanza", "San Carlos"] },
            { nombre: "BABA", parroquias: ["Baba", "Guare", "Isla de Bejucal"] },
            { nombre: "MONTALVO", parroquias: ["Montalvo"] },
            { nombre: "PUEBLOVIEJO", parroquias: ["Puebloviejo", "Puerto Pechiche", "San Juan"] },
            { nombre: "VINCES", parroquias: ["Vinces", "Antonio Sotomayor"] },
            { nombre: "VENTANAS", parroquias: ["Ventanas", "Zapotal"] },
            { nombre: "MOCACHE", parroquias: ["Mocache"] },
            { nombre: "BUENA FE", parroquias: ["San Jacinto de Buena Fe", "Patricia Pilar"] },
            { nombre: "VALENCIA", parroquias: ["Valencia"] },
            { nombre: "QUINSALOMA", parroquias: ["Quinsaloma"] },
            { nombre: "URDANETA", parroquias: ["Catarama", "Ricaurte"] }
        ]
    },
    {
        provincia: "EL ORO",
        cantones: [
            { nombre: "MACHALA", parroquias: ["Machala", "La Providencia", "Nueve de Mayo", "Puerto Bolívar", "El Cambio", "El Retiro"] },
            { nombre: "PASAJE", parroquias: ["Pasaje", "Bolívar", "Loma de Franco", "Ochoa León", "Buenavista", "Casacay", "La Peaña", "Progreso", "Uzhcurrumi", "Cañaquemada"] },
            { nombre: "SANTA ROSA", parroquias: ["Santa Rosa", "Puerto Jelí", "Balneario Jambelí", "Jumón", "Bellavista", "Bellamaría", "La Avanzada", "San Antonio", "Victoria"] },
            { nombre: "HUAQUILLAS", parroquias: ["Huaquillas", "Ecuador", "El Paraíso", "Hualtaco", "Milton Reyes", "Unión Lojana"] },
            { nombre: "ARENILLAS", parroquias: ["Arenillas", "Palmales", "Carcabón", "Chacras"] },
            { nombre: "PIÑAS", parroquias: ["Piñas", "La Susaya", "Piñas Grande", "Capiro", "La Bocana", "Moromoro", "Piedras", "San Roque", "Saracay"] }
        ]
    },
    {
        provincia: "ESMERALDAS",
        cantones: [
            { nombre: "ESMERALDAS", parroquias: ["Esmeraldas", "Bartolomé Ruiz", "5 de Agosto", "Simón Plata Torres", "Camarones", "Coronel Carlos Concha", "Chinca", "Majua", "San Mateo", "Tachina", "Vuelta Larga"] },
            { nombre: "ATACAMES", parroquias: ["Atacames", "La Unión", "Súa", "Tonchigüe", "Tonsupa"] },
            { nombre: "QUININDÉ", parroquias: ["Rosa Zárate", "Cube", "Chura", "Malimpia", "Viche", "La Unión"] },
            { nombre: "SAN LORENZO", parroquias: ["San Lorenzo", "Alto Tambo", "Ancón", "Calderón", "Carondelet", "5 de Junio", "Concepción", "Mataje", "San Javier de Cachaví", "Santa Rita", "Tambo", "Tululbí"] }
        ]
    },
    {
        provincia: "SANTA ELENA",
        cantones: [
            { nombre: "SANTA ELENA", parroquias: ["Santa Elena", "Ballenita", "Atahualpa", "Colonche", "Chanduy", "Manglaralto", "Simón Bolívar"] },
            { nombre: "SALINAS", parroquias: ["Salinas", "Anconcito", "José Luis Tamayo"] },
            { nombre: "LA LIBERTAD", parroquias: ["La Libertad"] }
        ]
    },
    {
        provincia: "SANTO DOMINGO DE LOS TSÁCHILAS",
        cantones: [
            { nombre: "SANTO DOMINGO", parroquias: ["Abraham Calazacón", "Bombolí", "Chiguilpe", "Río Toachi", "Río Verde", "Zaracay", "Alluriquín", "El Esfuerzo", "Luz de América", "Puerto Limón", "San Jacinto del Búa", "Santa María del Toachi", "Valle Hermoso"] },
            { nombre: "LA CONCORDIA", parroquias: ["La Concordia", "Monterrey", "La Villegas", "Plan Piloto"] }
        ]
    }
];

// Helper to flatten data
const processLocations = () => {
    const provincias: Provincia[] = [];
    const cantones: Canton[] = [];
    const parroquias: Parroquia[] = [];

    RAW_DATA.forEach((prov, pIdx) => {
        const pId = `p-${pIdx}`;
        provincias.push({ id: pId, name: prov.provincia });

        prov.cantones.forEach((cant, cIdx) => {
            const cId = `${pId}-c-${cIdx}`;
            cantones.push({ id: cId, name: cant.nombre, provinciaId: pId });

            if (cant.parroquias) {
                cant.parroquias.forEach((parr, rIdx) => {
                    const rId = `${cId}-r-${rIdx}`;
                    parroquias.push({ id: rId, name: parr, cantonId: cId });
                });
            }
        });
    });

    return { provincias, cantones, parroquias };
};

export const ECUADOR_LOCATIONS = processLocations();
