//
//  ExtensionPlayer.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 02-04-22.
//

import Foundation


extension Player {
    
    var average: Int {
        
        var num = (Double(stat1) + Double(stat2) + Double(stat3) + Double(stat4) + Double(stat5) + Double(stat6)) / 6
        
        num.round()
        
        if Int(stat2).isEven && Int(stat4).isEven {
            num += 16
        } else if Int(stat2).isOdd && Int(stat4).isOdd {
            num += 14
        } else {
            num += 15
        }
        
        if num > 99 {
            return 99
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
        switch stringType {
        case "Oro":
            return Gold()
        case "Plata":
            return Silver()
        case "Bronce":
            return Bronze()
        default:
            return Silver()
        }
    }
    
    var golKeeper: Bool {
        return position == .por
    }
    
}
