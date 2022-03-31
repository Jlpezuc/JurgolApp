//
//  Extensions.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 29-03-22.
//

import Foundation
import SwiftUI

extension Int16 {
    
    var isEven: Bool {
        if self % 2 == 0 {
            return true
        }
        return false
    }
    
    var isOdd: Bool {
        if self % 2 != 0 {
            return true
        }
        return false
    }
    
    var toString: String {
        return String(self)
    }
}
