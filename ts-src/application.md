# Applications
An Application is a rule fragment that can contain Rule Sets.  

An Application can be part of the Rules.Engine schema or its own schema, and thus can be validated 
within the Rules.Engine or on its own.  

An Application has its own Application Scope.  When within the Rules.Engine schema, the parent scope is the 
Global scope. Otherwise, it has no parent scope.  Its child scopes are Rule Set scopes.  The Application Scope's 
name is the same as the Application.

The name of an Application is unique within the Rules.Engine scope.

An Application has a Text Format, a Reference Format (and thus a JSON format) and an internal class 
representation.

## Text Format
The full Text Format for an application is a hint block (see [Hints](../hints.md)) as follows:

    <<ap name=NAME options=?OPTIONS>>

    Where:
        NAME:       is the required quoted (multi-word) or unquoted (single word) name of the Application
        ?OPTIONS:   are the optional options

Options may be provided that are specific to the application, for example the definition of custom behaviors. See
[Options](../options.md) and [Scopes](../scopes.md) to better understand options.

An Application has no text body other than the hint block.

If a Rule Set follows the Application hint block, it will be added to the Application.  If a Rule follows the 
Application hint block without a Rule Set, it will be added to a 'default' Rule Set within the Application.

The Application Parser is used to parse an Application.  An Application with no Rule Set or Rules can be parsed 
and will result in a valid Application Reference.

An Application can have more than one Rule Set.  When a Rule Set is encountered, the Application Parser will defer 
to the Rule Set parser.  If a rule and not a Rule Set is encountered, a default Rule Set will be used.

An Application's Text Format, that hat of its contained rule elements, end when another Application is encountered.

The following are valid examples:

### Empty Application

    <<ap name="Some Application">>

### Empty Application explicitly defined within the Rules.Engine scope

    <<re>> <<ap name="Some Application">>

### Series of empty Applications

    <<re>
    <<ap name="Some Application">>
    <<ap name="Another Application">>
    <<ap name="A third application">>

### Application with rule sets

    <<ap name="Some Application">>
        <<rs name="Set 1">> RULES
        <<rs name="Set 2">> RULES

    where RULES = the text format for Rules

### Implicit "Default" Application
    
    <<re> 
        <<rs name="Set 1">> RULES
        <<rs name="Set 2">> RULES

or

    <<rs name="Set 1">> RULES
    <<rs name="Set 2">> RULES

or  

    RULES

noting that the name of the Default Application is "Default" and reserved.
    
