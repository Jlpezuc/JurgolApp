//
//  Player+CoreDataProperties.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 29-03-22.
//
//

import Foundation
import CoreData

extension Player {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<Player> {
        return NSFetchRequest<Player>(entityName: "Player")
    }

    @NSManaged public var id: UUID
    
    @NSManaged public var name: String
    
    @NSManaged public var stat1: Int16
    @NSManaged public var stat2: Int16
    @NSManaged public var stat3: Int16
    @NSManaged public var stat4: Int16
    @NSManaged public var stat5: Int16
    @NSManaged public var stat6: Int16
    
    @NSManaged public var photo: Data
    
    @NSManaged public var country: String
    
    @NSManaged public var stringPosition: String
    
    @NSManaged public var goles: Int64
    
    @NSManaged public var partidos: Int64
    
    @NSManaged public var stringType: String

}

extension Player : Identifiable {

}

extension Player {
    
    var average: Int {
        
        var num = (Double(stat1) + Double(stat2) + Double(stat3) + Double(stat4) + Double(stat5) + Double(stat6)) / 6
        
        num.round()
        
        if stat2.isEven && stat4.isEven {
            num += 16
        } else if stat2.isOdd && stat4.isOdd {
            num += 14
        } else {
            num += 15
        }
        
        return Int(num)
        
    }
    
    var position: Position {
        for pos in Position.allCases {
            if pos.acronym == stringPosition {
                return pos
            }
        }
        return Position.por
    }
    
    var colors: CardColors {
        if stringType == "Oro" {
            return Gold()
        } else if stringType == "Plata" {
            return Silver()
        } else {
            return Bronze()
        }
    }
}
