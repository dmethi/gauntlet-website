# 🎲 Simulation Engine V2: 5-Year Data Rebuild Plan

## 🎯 **Current Status: Quick Fix Complete**
✅ **Fixed narrow variance bug**: 17-point → 39-point realistic ranges  
✅ **Simulation architecture validated**: 70/30 weighting working correctly  
✅ **Win probabilities normalized**: 100%/0% → realistic distributions  

## 🚀 **V2 Goals: Best-in-Class Simulation Engine**

### **Phase 1: Historical Data Collection**
**Target: 5 years of comprehensive fantasy data (2020-2024)**

#### Data Sources to Integrate:
- **Sleeper API**: Historical weekly scoring data
- **ESPN/Yahoo APIs**: Cross-platform validation 
- **FantasyPros**: Expert projections vs actual outcomes
- **NFL Official Stats**: Underlying performance metrics

#### Data Points to Capture:
```typescript
interface HistoricalPlayerWeek {
  playerId: string;
  season: number;
  week: number;
  position: string;
  team: string;
  
  // Projections (multiple sources)
  projectedPoints: {
    sleeper: number;
    espn: number;
    yahoo: number;
    fantasypros: number;
  };
  
  // Actual Performance
  actualPoints: number;
  
  // Context Variables
  gameScript: 'positive' | 'negative' | 'neutral';
  weather?: string;
  injuryStatus?: string;
  opposingDefenseRank: number;
}
```

### **Phase 2: Position-Specific Variance Models**

#### Research-Based Standard Deviations:
```typescript
const POSITION_VARIANCE_MODELS = {
  QB: {
    baseStdDev: 0.28,  // Most consistent position
    factors: {
      rushing: +0.05,   // Mobile QBs more volatile
      weather: +0.08,   // Outdoor/wind games
      opposing_pass_def: +0.03
    }
  },
  
  RB: {
    baseStdDev: 0.48,  // Highest variance (game script dependent)
    factors: {
      workload: -0.08,  // Bellcows more consistent
      goal_line: +0.12, // TD vultures create volatility
      opposing_run_def: +0.05
    }
  },
  
  WR: {
    baseStdDev: 0.42,  // High variance, target dependent
    factors: {
      target_share: -0.06, // Higher share = more consistent
      deep_threat: +0.08,  // Deep players more boom/bust
      slot_vs_outside: -0.03 // Slot more consistent
    }
  },
  
  TE: {
    baseStdDev: 0.36,  // More consistent than WRs
    factors: {
      target_share: -0.05,
      red_zone_usage: -0.04, // TEs reliable in RZ
      blocking_role: +0.06   // Blocking TEs less consistent
    }
  },
  
  K: {
    baseStdDev: 0.32,  // Weather/dome dependent
    factors: {
      dome_vs_outdoor: +0.12,
      wind_speed: +0.15,
      team_red_zone_efficiency: -0.08
    }
  },
  
  DST: {
    baseStdDev: 0.52,  // Extremely volatile
    factors: {
      turnover_rate: +0.15,  // Opportunistic defenses more volatile
      opposing_qb_tier: -0.08, // Facing bad QBs = more consistent
      home_vs_away: +0.05
    }
  }
};
```

### **Phase 3: Advanced Individual Player Modeling**

#### Player-Specific Profiles:
```typescript
interface PlayerVarianceProfile {
  playerId: string;
  position: string;
  
  // Career Patterns (3+ year minimum)
  careerVariance: {
    coefficient: number;    // Personal boom/bust tendency
    floorRating: number;    // How low they can go
    ceilingRating: number;  // Upside potential
    consistency: number;    // Week-to-week reliability
  };
  
  // Situational Modifiers
  situationalFactors: {
    vsTopDefenses: number;  // Performance vs elite units
    primetime: number;      // TNF/SNF/MNF performance
    weather: number;        // Outdoor game impact
    homeVsAway: number;     // Home field advantage
  };
  
  // Trend Analysis
  recentForm: {
    lastFourWeeks: number[];
    seasonTrend: 'improving' | 'declining' | 'stable';
    injuryRisk: number;
  };
  
  dataQuality: {
    sampleSize: number;
    confidenceLevel: number;
    lastUpdated: Date;
  };
}
```

### **Phase 4: Correlation & Advanced Features**

#### Team-Level Correlations:
- **Stack bonuses**: QB-WR combinations
- **Game script impact**: Team passing/rushing splits
- **Pace factors**: Fast/slow offenses
- **Weather correlations**: Dome vs outdoor performance

#### Live Game Adjustments:
- **Score-based updates**: Real-time game script changes
- **Injury substitutions**: Backup player modeling
- **Snap count tracking**: Playing time adjustments

### **Phase 5: Validation & Calibration**

#### Backtesting Requirements:
1. **Historical accuracy**: Test against 2023 season outcomes
2. **Betting line correlation**: Compare to DraftKings/FanDuel lines
3. **Expert consensus**: Validate against FantasyPros rankings
4. **Live performance**: Monitor real-time accuracy during season

#### Success Metrics:
- **Team score ranges**: 35-50 points P10-P90 (realistic)
- **Win probability accuracy**: Within 5% of actual outcomes
- **Margin prediction**: Mean absolute error < 8 points
- **Individual variance**: Player ranges match historical patterns

---

## 📅 **Implementation Timeline**

### **Phase 1: Data Collection (2-3 weeks)**
- Set up historical data pipelines
- Build projection error database
- Validate data quality across sources

### **Phase 2: Position Modeling (1-2 weeks)**  
- Implement position-specific variance
- Add contextual factors (weather, matchups)
- Test against current system

### **Phase 3: Player Profiles (2-3 weeks)**
- Build individual variance profiles
- Implement 70/30 weighting with rich data
- Add trend analysis features

### **Phase 4: Advanced Features (1-2 weeks)**
- Team correlations
- Live adjustment capabilities
- Performance monitoring

### **Total Timeline: ~6-8 weeks for production-ready V2**

---

## 🎯 **Expected Improvements**

| Metric | Current V1 | Target V2 |
|--------|-----------|----------|
| **Historical Data** | Limited/Fallback | 5 years comprehensive |
| **Position Variance** | Generic 0.4 std | Position-specific models |
| **Player Profiles** | Basic patterns | 3+ year individual history |
| **Contextual Factors** | None | Weather, matchups, trends |
| **Validation** | Manual testing | Systematic backtesting |
| **Accuracy** | Functional | Professional-grade |

This would make your simulation engine competitive with DraftKings/FanDuel internal models! 🚀
