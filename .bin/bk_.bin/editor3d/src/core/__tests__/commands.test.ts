/**
 * Enterprise Command System Tests
 * 
 * Comprehensive test suite for the command pattern implementation
 * including undo/redo, macro commands, serialization, and performance.
 */
import { CommandManager } from '../commands/CommandManager';
import { Command, MacroCommand, CommandResult, CommandMetadata, CommandPriority } from '../commands/Command';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';

// Mock commands for testing
class TestCommand extends Command {
  private value: number;
  private previousValue: number;

  constructor(value: number, metadata?: Partial<CommandMetadata>) {
    super({
      name: 'TestCommand',
      description: `Test command with value ${value}`,
      category: 'test',
      priority: CommandPriority.NORMAL,
      estimatedMemory: 1024,
      estimatedDuration: 1,
      ...metadata
    });
    this.value = value;
    this.previousValue = 0;
  }

  async execute(): Promise<CommandResult> {
    this.previousValue = 0; // Simulate previous state
    return {
      success: true,
      data: { value: this.value },
      metadata: this.metadata
    };
  }

  async undo(): Promise<CommandResult> {
    return {
      success: true,
      data: { value: this.previousValue },
      metadata: this.metadata
    };
  }

  protected serializeData(): any {
    return { value: this.value };
  }

  protected deserializeData(data: any): void {
    this.value = data.value;
  }

  protected generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class FailingCommand extends Command {
  constructor() {
    super({
      name: 'FailingCommand',
      description: 'Command that always fails',
      category: 'test',
      priority: CommandPriority.HIGH
    });
  }

  async execute(): Promise<CommandResult> {
    return {
      success: false,
      error: 'Command execution failed',
      metadata: this.metadata
    };
  }

  async undo(): Promise<CommandResult> {
    return {
      success: false,
      error: 'Command undo failed',
      metadata: this.metadata
    };
  }

  protected serializeData(): any {
    return {};
  }

  protected deserializeData(data: any): void {
    // No data to deserialize
  }

  protected generateId(): string {
    return `fail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

describe('Command System', () => {
  let commandManager: CommandManager;
  let eventEmitter: EventEmitter;
  let logger: Logger;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    logger = new Logger();
    commandManager = new CommandManager(eventEmitter, logger, {
      maxHistorySize: 10,
      enableSerialization: true,
      enablePerformanceTracking: true
    });
  });

  afterEach(() => {
    commandManager.clearHistory();
  });

  describe('Command Base Class', () => {
    it('should create command with proper metadata', () => {
      const command = new TestCommand(42);
      
      expect(command.getId()).toBeDefined();
      expect(command.getName()).toBe('TestCommand');
      expect(command.getCategory()).toBe('test');
      expect(command.getPriority()).toBe(CommandPriority.NORMAL);
      expect(command.getMetadata().estimatedMemory).toBe(1024);
      expect(command.getMetadata().estimatedDuration).toBe(1);
    });

    it('should validate command successfully', () => {
      const command = new TestCommand(42);
      const validation = command.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should serialize and deserialize command', () => {
      const command = new TestCommand(42);
      const serialized = command.serialize();
      
      expect(serialized.id).toBe(command.getId());
      expect(serialized.type).toBe('TestCommand');
      expect(serialized.data.value).toBe(42);
      
      const newCommand = new TestCommand(0);
      newCommand.deserialize(serialized);
      
      expect(newCommand.getMetadata().description).toBe('Test command with value 42');
    });

    it('should provide performance metrics', () => {
      const command = new TestCommand(42);
      const metrics = command.getPerformanceMetrics();
      
      expect(metrics.estimatedDuration).toBe(1);
      expect(metrics.actualDuration).toBe(0);
    });

    it('should provide memory impact', () => {
      const command = new TestCommand(42);
      const memory = command.getMemoryImpact();
      
      expect(memory.estimatedUsage).toBe(1024);
      expect(memory.actualUsage).toBe(0);
    });
  });

  describe('Command Manager', () => {
    it('should execute command successfully', async () => {
      const command = new TestCommand(42);
      const result = await commandManager.execute(command);
      
      expect(result.success).toBe(true);
      expect(result.data.value).toBe(42);
      expect(commandManager.canUndo()).toBe(true);
      expect(commandManager.getUndoCount()).toBe(1);
    });

    it('should handle command execution failure', async () => {
      const command = new FailingCommand();
      
      await expect(commandManager.execute(command)).rejects.toThrow('Command execution failed');
      expect(commandManager.canUndo()).toBe(false);
    });

    it('should undo command successfully', async () => {
      const command = new TestCommand(42);
      await commandManager.execute(command);
      
      const undoResult = await commandManager.undo();
      
      expect(undoResult?.success).toBe(true);
      expect(commandManager.canUndo()).toBe(false);
      expect(commandManager.canRedo()).toBe(true);
      expect(commandManager.getRedoCount()).toBe(1);
    });

    it('should redo command successfully', async () => {
      const command = new TestCommand(42);
      await commandManager.execute(command);
      await commandManager.undo();
      
      const redoResult = await commandManager.redo();
      
      expect(redoResult?.success).toBe(true);
      expect(commandManager.canUndo()).toBe(true);
      expect(commandManager.canRedo()).toBe(false);
    });

    it('should clear redo stack when new command is executed', async () => {
      const command1 = new TestCommand(1);
      const command2 = new TestCommand(2);
      
      await commandManager.execute(command1);
      await commandManager.undo();
      await commandManager.execute(command2);
      
      expect(commandManager.canRedo()).toBe(false);
      expect(commandManager.getRedoCount()).toBe(0);
    });

    it('should respect max history size', async () => {
      for (let i = 0; i < 15; i++) {
        await commandManager.execute(new TestCommand(i));
      }
      
      expect(commandManager.getUndoCount()).toBe(10); // maxHistorySize
    });

    it('should execute macro command successfully', async () => {
      const commands = [
        new TestCommand(1),
        new TestCommand(2),
        new TestCommand(3)
      ];
      
      const result = await commandManager.executeMacro(commands);
      
      expect(result.success).toBe(true);
      expect(result.data.executedCommands).toBe(3);
      expect(commandManager.getUndoCount()).toBe(1); // Macro counts as one command
    });

    it('should rollback macro command on failure', async () => {
      const commands = [
        new TestCommand(1),
        new FailingCommand(),
        new TestCommand(3)
      ];
      
      await expect(commandManager.executeMacro(commands)).rejects.toThrow('Command execution failed');
      expect(commandManager.getUndoCount()).toBe(0); // No commands should be in history
    });

    it('should provide command history', () => {
      const history = commandManager.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should provide redo stack', () => {
      const redoStack = commandManager.getRedoStack();
      expect(Array.isArray(redoStack)).toBe(true);
    });

    it('should provide statistics', () => {
      const stats = commandManager.getStats();
      
      expect(stats.totalCommands).toBe(0);
      expect(stats.undoStackSize).toBe(0);
      expect(stats.redoStackSize).toBe(0);
      expect(stats.averageExecutionTime).toBe(0);
      expect(stats.totalMemoryUsage).toBe(0);
    });

    it('should serialize command history', () => {
      const serialized = commandManager.serialize();
      expect(Array.isArray(serialized)).toBe(true);
    });

    it('should deserialize command history', () => {
      const serialized = commandManager.serialize();
      commandManager.deserialize(serialized);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should save state', async () => {
      await commandManager.save();
      const stats = commandManager.getStats();
      
      expect(stats.lastSaveTime).toBeGreaterThan(0);
    });
  });

  describe('Macro Command', () => {
    it('should create macro command with sub-commands', () => {
      const commands = [
        new TestCommand(1),
        new TestCommand(2),
        new TestCommand(3)
      ];
      
      const macro = new MacroCommand(commands);
      
      expect(macro.getCommands()).toHaveLength(3);
      expect(macro.getMetadata().description).toBe('Macro command with 3 sub-commands');
    });

    it('should execute all sub-commands in order', async () => {
      const commands = [
        new TestCommand(1),
        new TestCommand(2),
        new TestCommand(3)
      ];
      
      const macro = new MacroCommand(commands);
      const result = await macro.execute();
      
      expect(result.success).toBe(true);
      expect(result.data.executedCommands).toBe(3);
    });

    it('should undo all sub-commands in reverse order', async () => {
      const commands = [
        new TestCommand(1),
        new TestCommand(2),
        new TestCommand(3)
      ];
      
      const macro = new MacroCommand(commands);
      await macro.execute();
      const undoResult = await macro.undo();
      
      expect(undoResult.success).toBe(true);
      expect(undoResult.data.undoneCommands).toBe(3);
    });

    it('should rollback on sub-command failure', async () => {
      const commands = [
        new TestCommand(1),
        new FailingCommand(),
        new TestCommand(3)
      ];
      
      const macro = new MacroCommand(commands);
      const result = await macro.execute();
      
      expect(result.success).toBe(false);
      expect(result.data.executedCommands).toBe(1); // Only first command executed
    });

    it('should add and remove commands', () => {
      const macro = new MacroCommand([]);
      
      const command = new TestCommand(42);
      macro.addCommand(command);
      
      expect(macro.getCommands()).toHaveLength(1);
      expect(macro.getMetadata().description).toBe('Macro command with 1 sub-commands');
      
      const removed = macro.removeCommand(command.getId());
      expect(removed).toBe(true);
      expect(macro.getCommands()).toHaveLength(0);
    });

    it('should serialize macro command', () => {
      const commands = [
        new TestCommand(1),
        new TestCommand(2)
      ];
      
      const macro = new MacroCommand(commands);
      const serialized = macro.serialize();
      
      expect(serialized.type).toBe('MacroCommand');
      expect(serialized.data.commands).toHaveLength(2);
    });
  });

  describe('Performance and Memory', () => {
    it('should track execution time', async () => {
      const command = new TestCommand(42);
      const startTime = performance.now();
      
      await commandManager.execute(command);
      
      const stats = commandManager.getStats();
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });

    it('should handle concurrent execution', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(commandManager.execute(new TestCommand(i)));
      }
      
      await Promise.all(promises);
      
      expect(commandManager.getUndoCount()).toBe(5);
    });

    it('should validate commands before execution', async () => {
      const command = new TestCommand(42);
      const validation = command.validate();
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Event System Integration', () => {
    it('should emit events on command execution', (done) => {
      const command = new TestCommand(42);
      
      eventEmitter.on('command:executed', (data) => {
        expect(data.command).toBe(command);
        expect(data.result.success).toBe(true);
        done();
      });
      
      commandManager.execute(command);
    });

    it('should emit events on command undo', (done) => {
      const command = new TestCommand(42);
      
      eventEmitter.on('command:undone', (data) => {
        expect(data.command).toBe(command);
        expect(data.result.success).toBe(true);
        done();
      });
      
      commandManager.execute(command).then(() => {
        commandManager.undo();
      });
    });

    it('should emit events on history clear', (done) => {
      eventEmitter.on('history:cleared', () => {
        done();
      });
      
      commandManager.clearHistory();
    });
  });
}); 