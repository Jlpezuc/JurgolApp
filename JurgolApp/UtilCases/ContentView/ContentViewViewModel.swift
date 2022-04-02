//
//  ContentViewViewModel.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 26-03-22.
//

import Foundation

class CreateACardViewModel: ObservableObject {
    
    let persistenceController = PersistenceController.shared
    
    @Published var newPlayer = Player(context: PersistenceController.shared.viewContext)
    
    
    init() {
        initPlayer()
    }
    
    func initPlayer() {
        newPlayer.id = UUID()
        newPlayer.name = ""
        newPlayer.stat1 = 80
        newPlayer.stat2 = 80
        newPlayer.stat3 = 80
        newPlayer.stat4 = 80
        newPlayer.stat5 = 80
        newPlayer.stat6 = 80
        newPlayer.country = "🇨🇱"
        newPlayer.stringPosition = "POR"
        newPlayer.goles = 0
        newPlayer.partidos = 0
        newPlayer.stringType = "Plata"
    }
    
    
    
    /// Este metodo crea una instancia de player al que se le entrega name como atributo y se le asigna
    /// un id generico para luego guardarlo en el viewContext
    func addPlayer() {
//        let newPlayer = Player(context: persistenceController.viewContext)
//
//        newPlayer.id = UUID()
//        newPlayer.name = name
//        newPlayer.stat1 = stat1
//        newPlayer.stat2 = stat2
//        newPlayer.stat3 = stat3
//        newPlayer.stat4 = stat4
//        newPlayer.stat5 = stat5
//        newPlayer.stat6 = stat6
//        newPlayer.country = country
//        newPlayer.stringPosition = stringPosition
//        newPlayer.goles = 0
//        newPlayer.partidos = 0
//        newPlayer.stringType = stringType
        
        persistenceController.save()
        newPlayer = Player(context: PersistenceController.shared.viewContext)
        initPlayer()
    }
    
}


class ContentViewViewModel: ObservableObject {
    
    let persistenceController = PersistenceController.shared
    
    @Published var players: [Player] = []
//
//    @Published var name: String = ""
//
//    @Published var stat1: Double = 80
//    @Published var stat2: Double = 80
//    @Published var stat3: Double = 80
//    @Published var stat4: Double = 80
//    @Published var stat5: Double = 80
//    @Published var stat6: Double = 80
//
//    //@Published var photo: Data
//
//    @Published var country: String = "🇨🇱"
//
//    @Published var stringPosition: String = "POR"
//
//    @Published var stringType: String = "Plata"
    init() {
        persistenceController.viewContext.rollback()
        getPlayers()
    }
    
    /// Este metodo carga a los jugadores del viewContext en la variable players
    func getPlayers() {
        players = persistenceController.getPlayers()
    }
}
