//
//  Persistence.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 07-04-16.
//

import CoreData

struct PersistenceController {
    static let shared = PersistenceController()
    
    let container: NSPersistentContainer
    
    var viewContext: NSManagedObjectContext {
        return container.viewContext
    }

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "JurgolApp")
        if inMemory {
            container.persistentStoreDescriptions.first!.url = URL(fileURLWithPath: "/dev/null")
        }
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                #warning("fatalError provoca que la app se cierre")
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        })
    }
    
    
    /// Esta función se llama para guardar el viewContext, en caso de error
    /// hace el catch y printea el error
    func save() {
        do {
            try viewContext.save()
        } catch {
            viewContext.rollback()
            print("Error al guardar viewContext \(error.localizedDescription)")
        }
    }
    
    /// Esta función retorna del viewContext la lista de todos los jugadores
    func getPlayers() -> [Player] {
        let request: NSFetchRequest = Player.fetchRequest()
        
        do {
            return try viewContext.fetch(request)
        } catch {
            print("Error al recuperar jugadores: \(error.localizedDescription)")
            return []
        }
    }
}
