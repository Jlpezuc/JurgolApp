//
//  Player+CoreDataProperties.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 26-03-22.
//
//

import Foundation
import CoreData


extension Player {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<Player> {
        return NSFetchRequest<Player>(entityName: "Player")
    }

    @NSManaged public var name: String?
    @NSManaged public var id: UUID?

}

extension Player : Identifiable {

}
