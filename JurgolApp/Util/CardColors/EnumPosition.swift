//
//  EnumPosition.swift
//  JurgolApp
//
//  Created by Joaquín López Robertson on 29-03-22.
//

import Foundation

enum Position: String, Identifiable, CaseIterable {
    
    case por, li, ld, cad ,cai, dfc, mcd, mc, mi, md, mco, ed, ei, mp, sdd, sdi, dc
    
    var id: RawValue { return rawValue }
    
    var acronym: String {
        return rawValue.uppercased()
    }
    
    var name: String {
        switch self {
        case .por:
            return "Portero"
        case .li:
            return "Lateral Izquierdo"
        case .ld:
            return "Lateral Derecho"
        case .cad:
            return "Carrilero Derecho"
        case .cai:
            return "Carrilero Izquierdo"
        case .dfc:
            return "Defensa Central"
        case .mcd:
            return "Medio Centro Defensivo"
        case .mc:
            return "Medio Campo"
        case .mi:
            return "Medio Izquierdo"
        case .md:
            return "Medio Derecho"
        case .mco:
            return "Medio Centro Ofensivo"
        case .ed:
            return "Extremo Derecho"
        case .ei:
            return "Extremo Izquierdo"
        case .mp:
            return "Medio Punta"
        case .sdd:
            return "Segundo Delantero Derecho"
        case .sdi:
            return "Segundo Delantero Izquierdo"
        case .dc:
            return "Delantero Centro"
        }
    }
        
}
