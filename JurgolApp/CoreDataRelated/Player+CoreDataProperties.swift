//
//  Player+CoreDataProperties.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 02-04-22.
//
//

import Foundation
import CoreData


extension Player {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<Player> {
        return NSFetchRequest<Player>(entityName: "Player")
    }

    @NSManaged public var country: String?
    @NSManaged public var goles: Int64
    @NSManaged public var id: UUID?
    @NSManaged public var name: String?
    @NSManaged public var partidos: Int64
    @NSManaged public var stat1: Double
    @NSManaged public var stat2: Double
    @NSManaged public var stat3: Double
    @NSManaged public var stat4: Double
    @NSManaged public var stat5: Double
    @NSManaged public var stat6: Double
    @NSManaged public var stringPosition: String?
    @NSManaged public var stringType: String?

}

extension Player : Identifiable {

}
