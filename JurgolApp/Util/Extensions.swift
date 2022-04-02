//
//  Extensions.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 29-03-22.
//

import Foundation
import SwiftUI

extension Int {
    
    var isEven: Bool {
        if self % 2 == 0 {
            return true
        }
        return false
    }
    
    var isOdd: Bool {
        return !isEven
    }
    
    var toString: String {
        return String(self)
    }
}

extension Double {
    var asInt: Int {
        return Int(self)
    }
}
