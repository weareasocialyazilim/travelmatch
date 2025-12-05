/**
 * Accessibility Audit Utility
 * Comprehensive accessibility testing and validation for React Native apps
 * WCAG 2.1 AA compliant
 */

import { Platform, AccessibilityInfo } from 'react-native';
import { logger } from './logger';
import {
  getContrastRatio,
  MIN_TOUCH_TARGET,
  commonLabels,
} from './accessibility';

/**
 * Accessibility Issue Severity
 */
export enum A11ySeverity {
  CRITICAL = 'critical', // Must fix - blocks users
  SERIOUS = 'serious', // Should fix - difficult to use
  MODERATE = 'moderate', // Could fix - inconvenient
  MINOR = 'minor', // Nice to fix - minor improvement
}

/**
 * Accessibility Issue Type
 */
export enum A11yIssueType {
  MISSING_LABEL = 'missing_label',
  MISSING_ROLE = 'missing_role',
  MISSING_HINT = 'missing_hint',
  LOW_CONTRAST = 'low_contrast',
  SMALL_TOUCH_TARGET = 'small_touch_target',
  MISSING_STATE = 'missing_state',
  FOCUS_ORDER = 'focus_order',
  ANIMATION = 'animation',
  TEXT_SIZE = 'text_size',
  LANGUAGE = 'language',
}

/**
 * Accessibility Issue
 */
export interface A11yIssue {
  type: A11yIssueType;
  severity: A11ySeverity;
  component: string;
  message: string;
  suggestion: string;
  wcag: string; // WCAG guideline reference
}

/**
 * Audit Result
 */
export interface A11yAuditResult {
  passed: boolean;
  score: number; // 0-100
  issues: A11yIssue[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  timestamp: Date;
}

/**
 * Component Props for Auditing
 */
interface AuditableComponent {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: Record<string, boolean>;
  style?: Record<string, unknown>;
  children?: unknown;
}

/**
 * Accessibility Auditor Class
 */
class AccessibilityAuditorClass {
  private issues: A11yIssue[] = [];

  /**
   * Run full accessibility audit
   */
  audit = async (): Promise<A11yAuditResult> => {
    this.issues = [];

    // Check if screen reader is enabled
    const isScreenReaderEnabled =
      await AccessibilityInfo.isScreenReaderEnabled();

    // Check reduce motion preference
    const isReduceMotionEnabled =
      await AccessibilityInfo.isReduceMotionEnabled();

    // Log environment
    logger.info('A11y Audit Environment:', {
      platform: Platform.OS,
      screenReader: isScreenReaderEnabled,
      reduceMotion: isReduceMotionEnabled,
    });

    // Calculate results
    const summary = this.calculateSummary();
    const score = this.calculateScore();

    const result: A11yAuditResult = {
      passed: score >= 80 && summary.critical === 0,
      score,
      issues: this.issues,
      summary,
      timestamp: new Date(),
    };

    this.logResult(result);

    return result;
  };

  /**
   * Audit a single component
   */
  auditComponent = (
    componentName: string,
    props: AuditableComponent,
    type:
      | 'button'
      | 'text'
      | 'image'
      | 'input'
      | 'link'
      | 'container' = 'container',
  ): A11yIssue[] => {
    const componentIssues: A11yIssue[] = [];

    // Check accessibility label
    if (type !== 'container' && !props.accessibilityLabel) {
      componentIssues.push({
        type: A11yIssueType.MISSING_LABEL,
        severity:
          type === 'button' || type === 'input'
            ? A11ySeverity.CRITICAL
            : A11ySeverity.SERIOUS,
        component: componentName,
        message: `Missing accessibility label for ${type}`,
        suggestion: `Add accessibilityLabel prop: accessibilityLabel="${this.suggestLabel(
          componentName,
          type,
        )}"`,
        wcag: 'WCAG 2.1 - 1.1.1 Non-text Content (Level A)',
      });
    }

    // Check accessibility role
    if (
      (type === 'button' || type === 'link' || type === 'input') &&
      !props.accessibilityRole
    ) {
      componentIssues.push({
        type: A11yIssueType.MISSING_ROLE,
        severity: A11ySeverity.SERIOUS,
        component: componentName,
        message: `Missing accessibility role for ${type}`,
        suggestion: `Add accessibilityRole="${type}"`,
        wcag: 'WCAG 2.1 - 4.1.2 Name, Role, Value (Level A)',
      });
    }

    // Check accessibility hint for interactive elements
    if ((type === 'button' || type === 'link') && !props.accessibilityHint) {
      componentIssues.push({
        type: A11yIssueType.MISSING_HINT,
        severity: A11ySeverity.MODERATE,
        component: componentName,
        message: 'Missing accessibility hint',
        suggestion:
          'Add accessibilityHint to describe what happens when activated',
        wcag: 'WCAG 2.1 - 3.3.2 Labels or Instructions (Level A)',
      });
    }

    // Check accessible flag
    if (type !== 'container' && props.accessible === false) {
      componentIssues.push({
        type: A11yIssueType.MISSING_LABEL,
        severity: A11ySeverity.CRITICAL,
        component: componentName,
        message: 'Element is marked as not accessible',
        suggestion:
          'Remove accessible={false} or set to true for interactive elements',
        wcag: 'WCAG 2.1 - 4.1.2 Name, Role, Value (Level A)',
      });
    }

    // Check touch target size
    if (type === 'button' || type === 'link') {
      const style = props.style || {};
      const width =
        typeof style.width === 'number' ? style.width : MIN_TOUCH_TARGET;
      const height =
        typeof style.height === 'number' ? style.height : MIN_TOUCH_TARGET;

      if (width < MIN_TOUCH_TARGET || height < MIN_TOUCH_TARGET) {
        componentIssues.push({
          type: A11yIssueType.SMALL_TOUCH_TARGET,
          severity: A11ySeverity.SERIOUS,
          component: componentName,
          message: `Touch target too small (${width}x${height}px, minimum is ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px)`,
          suggestion: `Increase touch target size to at least ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px or add hitSlop`,
          wcag: 'WCAG 2.1 - 2.5.5 Target Size (Level AAA)',
        });
      }
    }

    // Check state for toggleable elements
    if (
      (type === 'button' && props.accessibilityRole === 'checkbox') ||
      props.accessibilityRole === 'switch'
    ) {
      if (
        !props.accessibilityState?.checked &&
        props.accessibilityState?.checked !== false
      ) {
        componentIssues.push({
          type: A11yIssueType.MISSING_STATE,
          severity: A11ySeverity.CRITICAL,
          component: componentName,
          message: 'Missing checked state for toggle element',
          suggestion: 'Add accessibilityState={{ checked: true/false }}',
          wcag: 'WCAG 2.1 - 4.1.2 Name, Role, Value (Level A)',
        });
      }
    }

    this.issues.push(...componentIssues);
    return componentIssues;
  };

  /**
   * Check color contrast
   */
  checkContrast = (
    foreground: string,
    background: string,
    componentName: string,
    isLargeText = false,
  ): A11yIssue | null => {
    try {
      const ratio = getContrastRatio(foreground, background);
      const requiredRatio = isLargeText ? 3 : 4.5;

      if (ratio < requiredRatio) {
        const issue: A11yIssue = {
          type: A11yIssueType.LOW_CONTRAST,
          severity: ratio < 3 ? A11ySeverity.CRITICAL : A11ySeverity.SERIOUS,
          component: componentName,
          message: `Insufficient color contrast: ${ratio.toFixed(
            2,
          )}:1 (required: ${requiredRatio}:1)`,
          suggestion: `Increase contrast between ${foreground} and ${background}`,
          wcag: isLargeText
            ? 'WCAG 2.1 - 1.4.3 Contrast (Minimum) (Level AA)'
            : 'WCAG 2.1 - 1.4.6 Contrast (Enhanced) (Level AAA)',
        };
        this.issues.push(issue);
        return issue;
      }
    } catch (error) {
      logger.error('Contrast check failed:', error);
    }
    return null;
  };

  /**
   * Check text size
   */
  checkTextSize = (
    fontSize: number,
    componentName: string,
  ): A11yIssue | null => {
    if (fontSize < 12) {
      const issue: A11yIssue = {
        type: A11yIssueType.TEXT_SIZE,
        severity: fontSize < 10 ? A11ySeverity.CRITICAL : A11ySeverity.SERIOUS,
        component: componentName,
        message: `Text size too small: ${fontSize}px (minimum recommended: 12px)`,
        suggestion: 'Increase font size to at least 12px for readability',
        wcag: 'WCAG 2.1 - 1.4.4 Resize Text (Level AA)',
      };
      this.issues.push(issue);
      return issue;
    }
    return null;
  };

  /**
   * Check animation for vestibular disorders
   */
  checkAnimation = (
    hasAnimation: boolean,
    respectsReduceMotion: boolean,
    componentName: string,
  ): A11yIssue | null => {
    if (hasAnimation && !respectsReduceMotion) {
      const issue: A11yIssue = {
        type: A11yIssueType.ANIMATION,
        severity: A11ySeverity.MODERATE,
        component: componentName,
        message: 'Animation does not respect reduce motion preference',
        suggestion:
          'Check AccessibilityInfo.isReduceMotionEnabled() and disable animations accordingly',
        wcag: 'WCAG 2.1 - 2.3.3 Animation from Interactions (Level AAA)',
      };
      this.issues.push(issue);
      return issue;
    }
    return null;
  };

  /**
   * Suggest accessibility label based on component name and type
   */
  private suggestLabel = (componentName: string, _type: string): string => {
    const name = componentName.toLowerCase();

    // Check common labels
    for (const [key, value] of Object.entries(commonLabels)) {
      if (name.includes(key)) {
        return value;
      }
    }

    // Generate from component name
    return componentName
      .replace(/([A-Z])/g, ' $1')
      .replace(/Button|Icon|Image/g, '')
      .trim();
  };

  /**
   * Calculate summary of issues
   */
  private calculateSummary = () => {
    return {
      critical: this.issues.filter((i) => i.severity === A11ySeverity.CRITICAL)
        .length,
      serious: this.issues.filter((i) => i.severity === A11ySeverity.SERIOUS)
        .length,
      moderate: this.issues.filter((i) => i.severity === A11ySeverity.MODERATE)
        .length,
      minor: this.issues.filter((i) => i.severity === A11ySeverity.MINOR)
        .length,
      total: this.issues.length,
    };
  };

  /**
   * Calculate accessibility score (0-100)
   */
  private calculateScore = (): number => {
    if (this.issues.length === 0) return 100;

    // Weight issues by severity
    const weights = {
      [A11ySeverity.CRITICAL]: 20,
      [A11ySeverity.SERIOUS]: 10,
      [A11ySeverity.MODERATE]: 5,
      [A11ySeverity.MINOR]: 2,
    };

    const totalPenalty = this.issues.reduce(
      (sum, issue) => sum + weights[issue.severity],
      0,
    );

    return Math.max(0, 100 - totalPenalty);
  };

  /**
   * Log audit result
   */
  private logResult = (result: A11yAuditResult): void => {
    const emoji = result.passed ? '✅' : '❌';

    logger.info(`\n${emoji} Accessibility Audit Results`);
    logger.info(`Score: ${result.score}/100`);
    logger.info(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    logger.info(`\nIssue Summary:`);
    logger.info(`  Critical: ${result.summary.critical}`);
    logger.info(`  Serious: ${result.summary.serious}`);
    logger.info(`  Moderate: ${result.summary.moderate}`);
    logger.info(`  Minor: ${result.summary.minor}`);

    if (result.issues.length > 0) {
      logger.info(`\nDetailed Issues:`);
      result.issues.forEach((issue, index) => {
        logger.warn(
          `\n[${index + 1}] ${issue.severity.toUpperCase()}: ${
            issue.component
          }`,
        );
        logger.warn(`    Type: ${issue.type}`);
        logger.warn(`    Message: ${issue.message}`);
        logger.warn(`    Suggestion: ${issue.suggestion}`);
        logger.warn(`    WCAG: ${issue.wcag}`);
      });
    }
  };

  /**
   * Get current issues
   */
  getIssues = (): A11yIssue[] => [...this.issues];

  /**
   * Clear all issues
   */
  clearIssues = (): void => {
    this.issues = [];
  };

  /**
   * Generate accessibility report as markdown
   */
  generateReport = (result: A11yAuditResult): string => {
    let report = `# Accessibility Audit Report\n\n`;
    report += `**Date:** ${result.timestamp.toISOString()}\n`;
    report += `**Score:** ${result.score}/100\n`;
    report += `**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    report += `## Summary\n\n`;
    report += `| Severity | Count |\n`;
    report += `|----------|-------|\n`;
    report += `| Critical | ${result.summary.critical} |\n`;
    report += `| Serious | ${result.summary.serious} |\n`;
    report += `| Moderate | ${result.summary.moderate} |\n`;
    report += `| Minor | ${result.summary.minor} |\n`;
    report += `| **Total** | **${result.summary.total}** |\n\n`;

    if (result.issues.length > 0) {
      report += `## Issues\n\n`;
      result.issues.forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.component}\n\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **Type:** ${issue.type}\n`;
        report += `- **Message:** ${issue.message}\n`;
        report += `- **Suggestion:** ${issue.suggestion}\n`;
        report += `- **WCAG Reference:** ${issue.wcag}\n\n`;
      });
    }

    return report;
  };
}

export const AccessibilityAuditor = new AccessibilityAuditorClass();

/**
 * Hook for running accessibility audit in development
 */
import { useEffect, useState } from 'react';

export const useAccessibilityAudit = (runOnMount = false) => {
  const [result, setResult] = useState<A11yAuditResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAudit = async () => {
    if (!__DEV__) return;

    setIsRunning(true);
    try {
      const auditResult = await AccessibilityAuditor.audit();
      setResult(auditResult);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (runOnMount && __DEV__) {
      runAudit();
    }
  }, [runOnMount]);

  return {
    result,
    isRunning,
    runAudit,
    issues: AccessibilityAuditor.getIssues(),
  };
};

export default AccessibilityAuditor;
