//
//  ContentViewViewModel.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 26-03-22.
//

import Foundation


class ContentViewViewModel: ObservableObject {
    
    let persistenceController = PersistenceController.shared
    
    @Published var players: [Player] = []
    
    @Published var name: String = ""
    
    init() {
        getPlayers()
    }
    
    
    /// Este metodo crea una instancia de player al que se le entrega name como atributo y se le asigna
    /// un id generico para luego guardarlo en el viewContext
    func addPlayer() {
        let newPlayer = Player(context: persistenceController.viewContext)
        newPlayer.name = name
        newPlayer.id = UUID()
        persistenceController.save()
        
    }
    
    /// Este metodo carga a los jugadores del viewContext en la variable players
    func getPlayers() {
        players = persistenceController.getPlayers()
    }
}
