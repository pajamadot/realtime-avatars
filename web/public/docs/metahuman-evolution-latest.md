# MetaHuman Evolver: Latest Scan

- Generated at (UTC): `2026-02-19T04:27:25+00:00`
- Cycle: `11`
- Unreal source root: `G:\UE\UnrealEngine`
- Totals: `12 plugins`, `70 modules`, `2898 source files`

## Delta From Previous Cycle

- New plugins: `0`
- Removed plugins: `0`
- New modules: `0`
- Removed modules: `0`
- Changed modules: `56`

Changed modules:
- `DNACalib/DNACalibLib`
- `DNACalib/DNACalibModule`
- `LiveLink/LiveLink`
- `LiveLink/LiveLinkComponents`
- `LiveLink/LiveLinkEditor`
- `LiveLink/LiveLinkGraphNode`
- `LiveLink/LiveLinkMovieScene`
- `LiveLink/LiveLinkSequencer`
- `MetaHumanAnimator/MetaHumanBatchProcessor`
- `MetaHumanAnimator/MetaHumanCaptureProtocolStack`
- `MetaHumanAnimator/MetaHumanCaptureSource`
- `MetaHumanAnimator/MetaHumanCaptureUtils`
- `MetaHumanAnimator/MetaHumanConfig`
- `MetaHumanAnimator/MetaHumanConfigEditor`
- `MetaHumanAnimator/MetaHumanCore`
- `MetaHumanAnimator/MetaHumanDepthGenerator`
- `MetaHumanAnimator/MetaHumanFaceAnimationSolver`
- `MetaHumanAnimator/MetaHumanFaceContourTracker`
- `MetaHumanAnimator/MetaHumanFaceFittingSolver`
- `MetaHumanAnimator/MetaHumanFootageIngest`
- `MetaHumanAnimator/MetaHumanIdentity`
- `MetaHumanAnimator/MetaHumanIdentityEditor`
- `MetaHumanAnimator/MetaHumanImageViewerEditor`
- `MetaHumanAnimator/MetaHumanPerformance`
- `MetaHumanAnimator/MetaHumanPipeline`
- `MetaHumanAnimator/MetaHumanSequencer`
- `MetaHumanAnimator/MetaHumanSpeech2Face`
- `MetaHumanAnimator/MetaHumanToolkit`
- `MetaHumanCalibrationDiagnostics/MetaHumanCalibrationDiagnostics`
- `MetaHumanCalibrationProcessing/MetaHumanCalibrationCore`

## Plugin Matrix

| Plugin | Category | Modules | One-line Docs |
|---|---|---:|---:|
| `DNACalib` | `Animation` | 3 | 0 |
| `LiveLink` | `Animation` | 7 | 0 |
| `MetaHumanAnimator` | `MetaHuman` | 28 | 4 |
| `MetaHumanCalibrationDiagnostics` | `MetaHuman` | 1 | 0 |
| `MetaHumanCalibrationProcessing` | `MetaHuman` | 3 | 0 |
| `MetaHumanCharacter` | `MetaHuman` | 7 | 0 |
| `MetaHumanCharacterUAF` | `MetaHuman` | 1 | 0 |
| `MetaHumanCoreTechLib` | `MetaHuman` | 5 | 0 |
| `MetaHumanLiveLink` | `MetaHuman` | 7 | 0 |
| `MetaHumanRuntime` | `Other` | 0 | 0 |
| `MetaHumanSDK` | `MetaHuman` | 3 | 0 |
| `RigLogic` | `Animation` | 5 | 0 |

## Module Highlights

### DNACalib

- `DNACalibLib` (Runtime): `60h / 36cpp`
  - Public deps: `Core, CoreUObject, Engine, RigLogicLib, UnrealEd`
  - Private deps: `n/a`
  - Sample classes: `AnimatedMapFilter, BaseImpl, BlendShapeFilter, BoundingBox, CalculateMeshLowerLODsCommand, ClearBlendShapesCommand`
  - Sample methods: `run, apply, setName, SetBlendShapeTargetDeltasCommand, SetVertexPositionsCommand, JointFilter::apply, setMeshIndex, RemoveAnimatedMapCommand`
- `DNACalibLibTest` (Runtime): `7h / 27cpp`
  - Public deps: `Core, DNACalibLib, GoogleTest, RigLogicLib`
  - Private deps: `n/a`
  - Sample classes: `AnimatedMapDNAReader, BlendShapeDNAReader, FDNACalibLibTest, FakeDNACReader, JointDNAReader, MeshDNAReader`
  - Sample methods: `FDNACalibLibTestSuite::GetTests, FDNACalibLibTestSuite::RunTest, ~FakeDNACReader`
- `DNACalibModule` (Runtime): `30h / 26cpp`
  - Public deps: `Core, CoreUObject, Engine, RigLogicModule, UnrealEd`
  - Private deps: `DNACalibLib, RigLogicLib`
  - Sample classes: `FDNACalibCalculateMeshLowerLODsCommand, FDNACalibClearBlendShapesCommand, FDNACalibCommandSequence, FDNACalibComputeVertexPositionDeltasCommand, FDNACalibConditionalCommand, FDNACalibDNAReader`
  - Sample methods: `Run, SetName, FDNACalibSetBlendShapeTargetDeltasCommand, FDNACalibSetVertexPositionsCommand, SetMeshIndex, FDNACalibRemoveAnimatedMapCommand, FDNACalibRemoveBlendShapeCommand, FDNACalibRemoveJointAnimationCommand`

### LiveLink

- `LiveLink` (Runtime): `47h / 41cpp`
  - Public deps: `Core, CoreUObject, Engine, LiveLinkInterface, LiveLinkMessageBusFramework`
  - Private deps: `AnimationCore, CinematicCamera, HeadMountedDisplay, InputCore, LiveLinkAnimationCore, Media, MessageLog, Messaging`
  - Sample classes: `ALiveLinkDataPreview, FClockOffsetEstimatorRamp, FLiveLinkAnimationAxisSwitchPreProcessorWorker, FLiveLinkAnimationFrameInterpolationProcessorWorker, FLiveLinkAnimationRoleToTransformWorker, FLiveLinkBasicFrameInterpolationProcessorWorker`
  - Sample methods: `GetRole, FetchWorker, ULiveLinkAnimationRole::StaticClass, ULiveLinkTransformRole::StaticClass, Initialize, PostEditChangeProperty, Update, FLiveLinkClient`
- `LiveLinkComponents` (Runtime): `8h / 5cpp`
  - Public deps: `Core, CoreUObject, Engine, LiveLinkInterface`
  - Private deps: `Slate, UnrealEd`
  - Sample classes: `FLiveLinkComponentsModule, ILiveLinkComponentsModule, ULiveLinkComponentController, ULiveLinkComponentSettings, ULiveLinkControllerBase, ULiveLinkLightController`
  - Sample methods: `PostLoad, GetDesiredComponentClass, IsRoleSupported, SetAttachedComponent, Tick, ApplyTransform, CheckForError, CleanupControllersInMap`
- `LiveLinkEditor` (Editor): `29h / 26cpp`
  - Public deps: `LiveLink, LiveLinkAnimationCore, LiveLinkInterface, SlateCore`
  - Private deps: `AnimGraph, AssetRegistry, BlueprintGraph, ClassViewer, Core, CoreUObject, DetailCustomizations, EditorFramework`
  - Sample classes: `FLiveLinkBoneAttachmentDetailCustomization, FLiveLinkBroadcastComponentDetailCustomization, FLiveLinkClientCommands, FLiveLinkComponentDetailCustomization, FLiveLinkControllerBaseDetailCustomization, FLiveLinkGraphPanelPinFactory`
  - Sample methods: `FReply::Handled, SLiveLinkSubjectRepresentationPicker::FLiveLinkSourceSubjectRole, Construct, FText::GetEmpty, SetValue, CustomizeDetails, GetValue, CustomizeChildren`
- `LiveLinkGraphNode` (UncookedOnly): `5h / 6cpp`
  - Public deps: `AnimGraph`
  - Private deps: `BlueprintGraph, Core, CoreUObject, Engine, KismetCompiler, LiveLink, LiveLinkAnimationCore, LiveLinkInterface`
  - Sample classes: `UAnimGraphNode_LiveLinkPose, UK2Node_EvaluateLiveLinkFrame, UK2Node_EvaluateLiveLinkFrameAtSceneTime, UK2Node_EvaluateLiveLinkFrameAtWorldTime, UK2Node_EvaluateLiveLinkFrameWithSpecificRole, UK2Node_UpdateVirtualSubjectDataBase`
  - Sample methods: `GetNodeTitle, AddPins, AllocateDefaultPins, GetEvaluateFunctionName, GetMenuCategory, GetStructPinName, GetTooltipText, EarlyValidation`
- `LiveLinkMovieScene` (Runtime): `16h / 14cpp`
  - Public deps: `Core, CoreUObject, LiveLinkInterface, MovieScene, MovieSceneTracks`
  - Private deps: `Engine`
  - Sample classes: `FLiveLinkStructPropertyBindings, FMovieSceneLiveLinkEnumHandler, FMovieSceneLiveLinkPropertyHandler, FMovieSceneLiveLinkSource, FMovieSceneLiveLinkTransformHandler, IMovieSceneLiveLinkPropertyHandler`
  - Sample methods: `RecordFrame, Initialize, CreateChannelProxy, FinalizeSection, CreateChannels, CreatePropertiesChannel, FillFrame, FillFrameInterpolated`
- `LiveLinkMultiUser` (UncookedOnly): `1h / 1cpp`
  - Public deps: `n/a`
  - Private deps: `ConcertSyncClient, Core, CoreUObject, LiveLinkComponents`
  - Sample classes: `FLiveLinkMultiUserModule`
  - Sample methods: `FLiveLinkMultiUserModule::ShutdownModule, FLiveLinkMultiUserModule::StartupModule, ShutdownModule, StartupModule`

### MetaHumanAnimator

- `MeshTrackerInterface` (Editor): `1h / 1cpp`
  - Public deps: `Core`
  - Private deps: `CoreUObject, Engine, Projects`
  - Sample classes: `IDepthGeneratorInterface, IDepthMapDiagnosticsInterface, IDepthProcessingMetadataProvider, IFaceTrackerNodeImplFactory, IFaceTrackerPostProcessingFilter, IFaceTrackerPostProcessingInterface`
  - Sample methods: `n/a`
- `MetaHumanBatchProcessor` (Editor): `7h / 6cpp`
  - Public deps: `Core, CoreUObject`
  - Private deps: `AssetDefinition, AudioEditor, ContentBrowser, ContentBrowserData, Engine, MetaHumanCore, MetaHumanCoreTech, MetaHumanCoreTechLib`
  - Sample classes: `FMetaHumanBatchMenuExtensions, FMetaHumanBatchProcessorModule, SMetaHumanBatchExportPathDialog, SMetaHumanSpeechToAnimProcessingSettings, UMetaHumanBatchOperation, UMetaHumanExportAnimSequenceSettings`
  - Sample methods: `FText::FromString, UPROPERTY, FReply::Handled, CanProcess, Construct, AddMenuExtensions, AddPerformanceMenuExtensions, AddSoundWaveMenuExtensions`
- `MetaHumanCaptureDataEditor` (Editor): `3h / 3cpp`
  - Public deps: `n/a`
  - Private deps: `CaptureDataCore, CaptureDataEditor, Core, CoreUObject, Engine, InputCore, MetaHumanCoreEditor, MetaHumanImageViewerEditor`
  - Sample classes: `FMetaHumanCaptureDataEditorModule, SMetaHumanCameraCombo`
  - Sample methods: `HandleSourceDataChanged, SMetaHumanCameraCombo::HandleSourceDataChanged, Construct, CreatePreviewComponent, FMetaHumanCaptureDataEditorModule::ShutdownModule, FMetaHumanCaptureDataEditorModule::StartupModule, FText::FromString, GetCurrentItemLabel`
- `MetaHumanCaptureProtocolStack` (Editor): `32h / 40cpp`
  - Public deps: `Core, MetaHumanCaptureUtils`
  - Private deps: `CoreUObject, Engine, Json, JsonUtilities, Networking, Sockets, UnrealEd`
  - Sample classes: `FBaseStream, FCPSTimerManager, FCaptureProtocolError, FCommunicationRunnable, FDataProvider, FDataSender`
  - Sample methods: `Parse, Stop, Deserialize, FCaptureProtocolError, Serialize, SendMessage, Start, GetBody`
- `MetaHumanCaptureSource` (Editor): `33h / 35cpp`
  - Public deps: `CaptureDataCore, Core, CoreUObject, Engine, ImgMedia, MetaHumanCaptureUtils`
  - Private deps: `AssetDefinition, AudioEditor, CameraCalibrationCore, CaptureDataUtils, DesktopWidgets, ImageWriteQueue, InputCore, Json`
  - Sample classes: `FCommandHandler, FCubicCameraInfo, FCubicCameraSystemIngest, FCubicCameraSystemTakeParser, FCubicTakeInfo, FDataStream`
  - Sample methods: `CancelProcessing, Shutdown, Startup, GetTakes, Create, GetNumTakes, GetTakeIds, IsProcessing`
- `MetaHumanCaptureUtils` (Editor): `9h / 6cpp`
  - Public deps: `Core, CoreUObject, Engine`
  - Private deps: `n/a`
  - Sample classes: `FAbortableAsyncTask, FAsyncTaskInternal, FCaptureEventSource, FCaptureEventSourceWithLimiter, FStopToken, ICaptureEventSource`
  - Sample methods: `MoveTemp, IsValid, AfterAll, Create, DECLARE_DELEGATE, Decrease, FCallbackSynchronizer, FCallbackSynchronizer::AfterAll`

### MetaHumanCalibrationDiagnostics

- `MetaHumanCalibrationDiagnostics` (Editor): `6h / 5cpp`
  - Public deps: `CaptureDataCore, Core, CoreUObject, Engine`
  - Private deps: `CaptureDataEditor, CaptureDataUtils, CaptureUtils, ContentBrowser, ImageCore, ImageWrapper, ImgMedia, InputCore`
  - Sample classes: `FMetaHumanCalibrationDiagnosticsCommands, FMetaHumanCalibrationErrorCalculator, IFeatureDetector, SCalibrationDiagnosticsImageViewer, SCalibrationDiagnosticsWindow, UMetaHumanCalibrationDiagnosticsOptions`
  - Sample methods: `FGetActionCheckState::CreateSP, FReply::Handled, CalculateErrors, Construct, ContainsErrors, DetectFeatures, FMath::Sqrt, FMetaHumanCalibrationErrorCalculator::ContainsErrors`

### MetaHumanCalibrationProcessing

- `MetaHumanCalibrationCore` (Editor): `10h / 11cpp`
  - Public deps: `CaptureDataCore, Core, CoreUObject, Engine`
  - Private deps: `CaptureDataEditor, CaptureDataUtils, CaptureUtils, ContentBrowser, ImageCore, ImageWrapper, ImgMedia, InputCore`
  - Sample classes: `FCameraDescriptor, FMetaHumanCalibrationAreaSelection, FMetaHumanCalibrationFrameResolver, FMetaHumanCalibrationNotificationManager, FMetaHumanCalibrationStyle, FMetaHumanChessboardPointCounter`
  - Sample methods: `FMetaHumanChessboardPointCounter::Update, Update, FilterFramePaths, SMetaHumanImageViewer::OnMouseButtonUp, GetImagePaths, Construct, FMetaHumanCalibrationFrameResolver, FMetaHumanCalibrationFrameResolver::FCameraDescriptor`
- `MetaHumanCalibrationGenerator` (Editor): `10h / 9cpp`
  - Public deps: `CaptureDataCore, Core, CoreUObject, Engine`
  - Private deps: `CaptureDataEditor, CaptureDataUtils, CaptureUtils, ContentBrowser, ImageCore, ImageWrapper, ImgMedia, InputCore`
  - Sample classes: `FMetaHumanCalibrationAutoFrameSelection, FMetaHumanCalibrationGeneratorState, FMetaHumanCalibrationPatternDetector, FMetaHumanCalibrationViewCommands, FMetaHumanCalibrationWindowCommands, SMetaHumanCalibrationGeneratorWindow`
  - Sample methods: `FReply::Handled, FGetActionCheckState::CreateSP, FMetaHumanCalibrationPatternDetector::FDetectedFrame, Construct, DetectForFrame, FMetaHumanCalibrationStyle::Get, GENERATED_BODY, OnClose`
- `MetaHumanCalibrationLib` (Editor): `215h / 101cpp`
  - Public deps: `n/a`
  - Private deps: `CaptureDataCore, Core, Eigen, ImageCore, OpenCV, OpenCVHelper, RigLogicLib, UnrealEd`
  - Sample classes: `AABBTree, AbstractProgressReporter, AddFunction, AdditiveRBFSolver, Affine, AffineVariable`
  - Sample methods: `Init, J, result, FromBinaryFile, T, ToBinaryFile, residual, std::runtime_error`

### MetaHumanCharacter

- `MetaHumanCharacter` (Runtime): `13h / 6cpp`
  - Public deps: `Core, CoreUObject, Engine, ImageCore, MetaHumanCharacterPalette, MetaHumanSDKRuntime, Projects, SlateCore`
  - Private deps: `n/a`
  - Sample classes: `FMetaHumanCharacterStyle, UMetaHumanCharacter, UMetaHumanCharacterThumbnailAux`
  - Sample methods: `Append, AreAllResolutionsEqualTo, ConfigureCollection, FImageInfo, FMetaHumanCharacterCustomVersion::GUID, FMetaHumanCharacterGeneratedAssets::RemoveAssetMetadata, FMetaHumanCharacterSkinSettings::GetFinalSkinTextureSet, FMetaHumanCharacterSkinTextureSet::Append`
- `MetaHumanCharacterEditor` (Editor): `91h / 90cpp`
  - Public deps: `MetaHumanCoreTech, MetaHumanCoreTechLib, MetaHumanSDKEditor, RigLogicModule`
  - Private deps: `AnimGraph, AnimGraphRuntime, AppFramework, ApplicationCore, AssetDefinition, BlueprintGraph, ChaosClothAssetEngine, ChaosOutfitAssetEngine`
  - Sample classes: `AMetaHumanCharacterEditorActor, AMetaHumanInvisibleDrivingActor, FAutoRigCommandChange, FCostumeParametersOverridesDetails, FMetaHumanCharacterAssetObserver, FMetaHumanCharacterAssetViewItemDragDropOp`
  - Sample methods: `FReply::Handled, Construct, Setup, FMetaHumanCharacterEditorStyle::Get, Shutdown, MakeToolView, GetToolProperties, BuildTool`
- `MetaHumanCharacterMigrationEditor` (Editor): `3h / 1cpp`
  - Public deps: `n/a`
  - Private deps: `AssetTools, Core, CoreUObject, Engine, HairStrandsCore, Json, JsonUtilities, MetaHumanCharacter`
  - Sample classes: `UMetaHumanMigrationAssetCollection, UMetaHumanMigrationDatabase`
  - Sample methods: `FMath::Lerp, FMetaHumanCharacterMigrationEditorModule::LogError, FMetaHumanCharacterMigrationEditorModule::LogWarning, FMetaHumanCharacterMigrationEditorModule::MigrateMetaHuman, FMetaHumanCharacterMigrationEditorModule::OnMetaHumanImportStarted, FMetaHumanCharacterMigrationEditorModule::OnShouldImportMetaHumanAssetOrFile, FMetaHumanCharacterMigrationEditorModule::SetEyes, FMetaHumanCharacterMigrationEditorModule::SetGrooms`
- `MetaHumanCharacterPalette` (Runtime): `23h / 18cpp`
  - Public deps: `Core, CoreUObject, DeveloperSettings, Engine, MetaHumanSDKRuntime`
  - Private deps: `n/a`
  - Sample classes: `IMetaHumanCharacterActorInterface, IMetaHumanValidationContext, UMetaHumanCharacterActorInterface, UMetaHumanCharacterEditorPipeline, UMetaHumanCharacterEditorPipelineSpecification, UMetaHumanCharacterInstance`
  - Sample methods: `UMetaHumanCharacterInstance::TryGetAnySlotSelection, Assemble, GetRuntimeCharacterPipeline, IsValid, UMetaHumanCharacterInstance::Assemble, FMetaHumanPaletteItemKey, GetEditorPipeline, GetPaletteEditorPipeline`
- `MetaHumanCharacterPaletteEditor` (Editor): `19h / 17cpp`
  - Public deps: `n/a`
  - Private deps: `AdvancedPreviewScene, AssetDefinition, ContentBrowser, Core, CoreUObject, EditorFramework, EditorInteractiveToolsFramework, Engine`
  - Sample classes: `FMetaHumanCharacterPaletteEditorCommands, FMetaHumanCharacterPaletteEditorModule, FMetaHumanCharacterPaletteEditorToolkit, FMetaHumanCharacterPaletteViewportClient, IMetaHumanCharacterEditorActorInterface, SCharacterPartsView`
  - Sample methods: `FReply::Unhandled, GetAssetCategories, GetAssetClass, GetAssetColor, GetAssetDisplayName, FReply::Handled, GetSpecification, SetObjectToEdit`
- `MetaHumanDefaultEditorPipeline` (Editor): `11h / 10cpp`
  - Public deps: `ChaosClothAssetEngine, ChaosOutfitAssetEngine, Core, CoreUObject, Engine, HairStrandsCore, MetaHumanCharacter, MetaHumanCharacterEditor`
  - Private deps: `AssetTools, Blutility, ControlRigDeveloper, DataflowEngine, EditorScriptingUtilities, FileUtilities, GeometryScriptingCore, IKRig`
  - Sample classes: `AMetaHumanDefaultEditorPipelineActor, FMetaHumanMaterialBakingOptionsDetailCustomziation, UCharacterPipelineDataMap, ULODBakingUtility, UMetaHumanDefaultEditorPipeline, UMetaHumanDefaultEditorPipelineBase`
  - Sample methods: `GetSpecification, BuildItem, UpdateActorBlueprint, WriteActorBlueprint, FMath::Max, GenerateSkeleton, UnpackCollectionAssets, AMetaHumanDefaultEditorPipelineActor`

### MetaHumanCharacterUAF

- `MetaHumanCharacterUAFEditor` (Editor): `1h / 2cpp`
  - Public deps: `Core, CoreUObject, DeveloperSettings, Engine, MetaHumanCharacterEditor, MetaHumanCharacterPalette, MetaHumanDefaultEditorPipeline, MetaHumanSDKRuntime`
  - Private deps: `n/a`
  - Sample classes: `UMetaHumanCharacterUAFProjectSettings`
  - Sample methods: `FPaths::Combine, UMetaHumanCharacterUAFProjectSettings`

### MetaHumanCoreTechLib

- `MetaHumanCaptureData` (Runtime): `7h / 14cpp`
  - Public deps: `Core`
  - Private deps: `CaptureDataCore, DirectoryWatcher, ImgMedia, MetaHumanImageViewer`
  - Sample classes: `FFrameNumberTransformer, FFramePathResolver, FFramePathResolverSingleFile, FSequencedImageTrackInfo, FTrackingPathUtils`
  - Sample methods: `FFrameNumberTransformer, CalculateRateMatchingDropFrames, FFramePathResolver, FTrackingPathUtils::GetTrackingFilePathAndInfo, GetTrackingFilePathAndInfo, ResolvePath, DECLARE_LOG_CATEGORY_EXTERN, ExpandFilePathFormat`
- `MetaHumanCoreTech` (Runtime): `18h / 11cpp`
  - Public deps: `n/a`
  - Private deps: `Core, CoreUObject, Engine, Projects, Slate, SlateCore`
  - Sample classes: `FMetaHumanHeadTransform, FMetaHumanLowpassFilter, FMetaHumanOneEuroFilter, FMetaHumanRealtimeCalibration, FMetaHumanRealtimeSmoothing, SAudioDrivenAnimationMood`
  - Sample methods: `BurnLineIntoImage, BurnPointsIntoImage, FMetaHumanOneEuroFilter, Filter, ProcessFrame, BoneToMesh, CalculateAlpha, CalculateCutoff`
- `MetaHumanCoreTechLib` (Editor): `299h / 166cpp`
  - Public deps: `Eigen, MetaHumanSDKRuntime, RigLogicLib, RigLogicModule`
  - Private deps: `CaptureDataCore, Core, CoreUObject, Engine, ImageCore, Json, MetaHumanCoreTech, OnlineSubsystem`
  - Sample classes: `FMetaHumanCharacterIdentity, MetaHumanCreatorAPI, BodyShapeEditor, FMetaHumanCharacterBodyIdentity, MetaHumanCreatorBodyAPI, AABBTree`
  - Sample methods: `Init, FromBinaryFile, ToBinaryFile, Load, T, result, Evaluate, J`
- `MetaHumanImageViewer` (Runtime): `2h / 2cpp`
  - Public deps: `n/a`
  - Private deps: `Core, CoreUObject, InputCore, MetaHumanCoreTech, Slate, SlateCore`
  - Sample classes: `FMetaHumanImageViewerModule, SMetaHumanImageViewer`
  - Sample methods: `FReply::Handled, Construct, FMetaHumanImageViewerModule::ShutdownModule, FMetaHumanImageViewerModule::StartupModule, GeometryChanged, HandleMouseButtonDown, HandleMouseButtonUp, HandleMouseMove`
- `MetaHumanPipelineCore` (Editor): `16h / 16cpp`
  - Public deps: `Eigen`
  - Private deps: `AudioPlatformConfiguration, CaptureDataCore, Core, CoreUObject, Engine, EventLoop, MetaHumanCaptureData, MetaHumanCoreTech`
  - Sample classes: `FAudioConvertNode, FAudioDataType, FAudioLoadNode, FAudioSaveNode, FBurnContoursNode, FConnection`
  - Sample methods: `Process, Start, ScopeLock, ToString, End, DoWork, FPipeline::Run, IsRunning`

### MetaHumanLiveLink

- `LiveLinkFaceDiscovery` (Runtime): `2h / 2cpp`
  - Public deps: `CaptureProtocolStack, CaptureUtils, Core`
  - Private deps: `CoreUObject, Engine, Slate, SlateCore`
  - Sample classes: `FLiveLinkFaceDiscovery, FLiveLinkFaceDiscoveryModule`
  - Sample methods: `CreateServer, FLiveLinkFaceDiscovery::CreateServer, FLiveLinkFaceDiscovery::Pack, FLiveLinkFaceDiscovery::Refresh, FLiveLinkFaceDiscovery::SendRequestBurst, FLiveLinkFaceDiscovery::Start, FLiveLinkFaceDiscovery::Stop, FLiveLinkFaceDiscovery::UpdateDelegate`
- `LiveLinkFaceSource` (Runtime): `9h / 8cpp`
  - Public deps: `Core, Engine`
  - Private deps: `CaptureProtocolStack, CaptureUtils, CoreUObject, HTTP, InputCore, Json, JsonUtilities, LiveLink`
  - Sample classes: `FLiveLinkFaceControl, FLiveLinkFacePacket, FLiveLinkFaceSource, FLiveLinkFaceSourceModule, ULiveLinkFaceSourceBlueprint, ULiveLinkFaceSourceDefaults`
  - Sample methods: `Connect, GENERATED_BODY, GetSubjects, Stop, CreateSource, Disconnect, FLiveLinkFaceControl::Connect, FLiveLinkFaceControl::Disconnect`
- `LiveLinkFaceSourceEditor` (Editor): `3h / 3cpp`
  - Public deps: `n/a`
  - Private deps: `CaptureProtocolStack, CaptureUtils, Core, CoreUObject, Engine, InputCore, LiveLinkFaceDiscovery, LiveLinkFaceSource`
  - Sample classes: `FLiveLinkFaceSourceCustomization, FLiveLinkFaceSourceEditorModule, SLiveLinkFaceDiscoveryPanel`
  - Sample methods: `FText::FromString, Construct, CustomizeDetails, EnginePreExit, FLiveLinkFaceSourceCustomization, FLiveLinkFaceSourceCustomization::CustomizeDetails, FLiveLinkFaceSourceCustomization::MakeInstance, FLiveLinkFaceSourceCustomization::Validate`
- `MetaHumanLiveLinkSource` (Runtime): `4h / 4cpp`
  - Public deps: `Engine, LiveLink, LiveLinkInterface`
  - Private deps: `Core, CoreUObject, MetaHumanCoreTech, Projects, RenderCore, Slate, SlateCore`
  - Sample classes: `FMetaHumanLiveLinkSourceModule, FMetaHumanLiveLinkSourceStyle, FMetaHumanSmoothingPreProcessorWorker, UMetaHumanLiveLinkSubjectSettings, UMetaHumanSmoothingPreProcessor`
  - Sample methods: `GetRole, PostEditChangeChainProperty, ULiveLinkBasicRole::StaticClass, CaptureNeutralFrame, CaptureNeutralHeadPose, CaptureNeutrals, FMetaHumanLiveLinkSourceModule::ShutdownModule, FMetaHumanLiveLinkSourceModule::StartupModule`
- `MetaHumanLiveLinkSourceEditor` (Editor): `3h / 3cpp`
  - Public deps: `LiveLinkInterface, UnrealEd`
  - Private deps: `Core, CoreUObject, Engine, MetaHumanCoreTech, MetaHumanLiveLinkSource, Slate, SlateCore`
  - Sample classes: `FMetaHumanLiveLinkSourceEditorModule, FMetaHumanLiveLinkSubjectSettingsCustomization, FMetaHumanSmoothingPreProcessorCustomization`
  - Sample methods: `FReply::Handled, FText::FromString, MakeInstance, CustomizeChildren, CustomizeDetails, CustomizeHeader, FMetaHumanLiveLinkSourceEditorModule::ShutdownModule, FMetaHumanLiveLinkSourceEditorModule::StartupModule`
- `MetaHumanLocalLiveLinkSource` (Runtime): `33h / 28cpp`
  - Public deps: `MetaHumanLiveLinkSource`
  - Private deps: `AudioMixerWasapi, AudioPlatformConfiguration, Core, CoreUObject, Engine, InputCore, LiveLink, LiveLinkInterface`
  - Sample classes: `FVideoSample, FAudioSample, FAudioSourceNode, FMediaPlayerNode, FMediaPlayerUENode, FMediaPlayerWMFNode`
  - Sample methods: `GENERATED_BODY, Start, Construct, Process, FReply::Handled, SetError, Close, End`

### MetaHumanRuntime

- No modules found.

### MetaHumanSDK

- `InterchangeDNA` (Editor): `3h / 2cpp`
  - Public deps: `Core, InterchangeCommon, InterchangeCore, InterchangeEngine, InterchangeImport, InterchangeNodes, InterchangePipelines, LevelSequence`
  - Private deps: `CoreUObject, Engine, Projects, RigLogicModule, Slate, SlateCore`
  - Sample classes: `FDnaMeshPayloadContext, FDnaMorphTargetPayloadContext, FDnaPayloadContextBase, FInterchangeDnaModule, UDNAMeshVertexColorDataAsset, UMetaHumanInterchangeDnaTranslator`
  - Sample methods: `FetchMeshPayload, FetchMeshPayloadInternal, GetMeshPayloadData, AddDNAMissingJoints, FDnaMeshPayloadContext::FetchMeshPayload, FDnaMeshPayloadContext::FetchMeshPayloadInternal, FDnaMeshPayloadContext::PopulateStaticMeshDescription, FDnaMorphTargetPayloadContext::FetchMeshPayload`
- `MetaHumanSDKEditor` (Editor): `39h / 38cpp`
  - Public deps: `n/a`
  - Private deps: `n/a`
  - Sample classes: `FAutorigResponse, FExchangeCodeHandler, FInstalledMetaHuman, FMetaHumanAssetUpdateHandler, FMetaHumanImport, FMetaHumanManager`
  - Sample methods: `FMetaHumanStyleSet::Get, FReply::Handled, Construct, Verify_Implementation, CreateRequest, Get, OnRequestCompleted, AsString`
- `MetaHumanSDKRuntime` (Runtime): `5h / 3cpp`
  - Public deps: `Core`
  - Private deps: `AnimGraphRuntime, AnimationCore, ControlRig, CoreUObject, Engine, RigVM, Slate, SlateCore`
  - Sample classes: `FMetaHumanSDKRuntimeModule, UMetaHumanComponentBase, UMetaHumanComponentUE`
  - Sample methods: `BeginPlay, FMetaHumanSDKRuntimeModule::ShutdownModule, FMetaHumanSDKRuntimeModule::StartupModule, GetBodySkelMeshComponent, GetSkelMeshComponentByName, LoadAndRunAnimBP, OnRegister, OnUnregister`

### RigLogic

- `RigLogicDeveloper` (UncookedOnly): `2h / 2cpp`
  - Public deps: `AnimationCore`
  - Private deps: `AnimGraph, BlueprintGraph, Core, CoreUObject, Engine, MessageLog, RigLogicModule`
  - Sample classes: `FRigLogicDeveloperModule, UAnimGraphNode_RigLogic`
  - Sample methods: `FRigLogicDeveloperModule::ShutdownModule, FRigLogicDeveloperModule::StartupModule, GetNodeTitle, GetTooltipText, ShutdownModule, StartupModule, UAnimGraphNode_RigLogic::GetNodeTitle, UAnimGraphNode_RigLogic::GetTooltipText`
- `RigLogicEditor` (Editor): `6h / 5cpp`
  - Public deps: `ApplicationCore, ControlRig, Core, CoreUObject, DesktopPlatform, EditorFramework, EditorWidgets, Engine`
  - Private deps: `n/a`
  - Sample classes: `FDNAImporter, FRigLogicEditor, SDNAAssetImportWindow, UDNAAssetImportFactory, UDNAAssetImportUI, UDNAImporterLibrary`
  - Sample methods: `GetImportOptions, Reimport, ApplyImportUIToImportOptions, CanEditChange, CanImport, CanReimport, CleanUp, Construct`
- `RigLogicLib` (Runtime): `252h / 90cpp`
  - Public deps: `ControlRig, Core, CoreUObject, EditorFramework, Engine, UnrealEd`
  - Private deps: `n/a`
  - Sample classes: `Evaluator, Factory, LUTFilter, OutputInstance, PolyAllocator, AdditiveRBFSolver`
  - Sample methods: `create, calculate, FilteredBinaryInputArchive::process, process, createInstance, load, read, save`
- `RigLogicLibTest` (Runtime): `42h / 77cpp`
  - Public deps: `Core, GoogleTest, RigLogicLib`
  - Private deps: `n/a`
  - Sample classes: `CanonicalReader, BinaryStreamWriterTest, FRigLogicLibTest, FakeDNAReader, FakeReader, QuaternionReader`
  - Sample methods: `getBytes, getAnimatedMaps, getBlendShapes, getConditionals, getJoints, lodConstraintToIndex, create, getInstanceFactory`
- `RigLogicModule` (Runtime): `22h / 18cpp`
  - Public deps: `ControlRig, Core, CoreUObject, EditorFramework, Engine, MessageLog, Projects, RigLogicLib`
  - Private deps: `AnimGraphRuntime, AnimationCore, RHI, RenderCore, SkeletalMeshUtilitiesCommon`
  - Sample classes: `FArchiveMemoryStream, FDNAReader, FDNAToSkelMeshMap, FRigInstance, FRigLogic, FRigLogicMemoryStream`
  - Sample methods: `FString, FVector, GetNeuralNetworkCount, Unwrap, read, write, GetAnimatedMapIndicesForLOD, GetBlendShapeChannelIndicesForLOD`

## One-line Docs Found

### MetaHumanAnimator

- `Content\GenericTracker\VERSIONS.txt`: Tracking models come from Hyprsense/Hyprface2D-python repo: tag hyprface-0.1.4
- `Content\Python\ReadMe.txt`: The purpose of this document is to provide details on how to use the python scripts included in the content folder.
- `Content\Speech2Face\VERSIONS.txt`: Tracking models copied on 19th Jan 2024. See README.md in Research/Wav2Face repo: tag wav2face-0.0.10
- `Content\StereoCaptureTools\ReadMe.txt`: The Stereo Capture Tools have moved!

## Official Watch

- MetaHuman docs reachability: `5`/`5`
- Epic Unreal repo feed availability: `restricted_or_unavailable`

### MetaHuman Official Docs

- `MetaHuman Documentation`: status=`200`, title=`MetaHuman Documentation | MetaHuman Documentation | Epic Developer Community`
- `MetaHumans in Unreal Engine`: status=`200`, title=`MetaHumans in Unreal Engine | MetaHuman Documentation | Epic Developer Community`
- `MetaHuman Animator`: status=`200`, title=`MetaHuman Animator | MetaHuman Documentation | Epic Developer Community`
- `Realtime Animation Using Live Link`: status=`200`, title=`Realtime Animation Using Live Link | MetaHuman Documentation | Epic Developer Community`
- `Mesh to MetaHuman`: status=`200`, title=`Mesh to MetaHuman | MetaHuman Documentation | Epic Developer Community`

### Epic Unreal Engine Repo Feeds

- `releases`: status=`404`, ok=`False`
- `tags`: status=`404`, ok=`False`
- `commits`: status=`404`, ok=`False`

Feed errors:
- `releases: status=404 (HTTPError: Not Found)`
- `tags: status=404 (HTTPError: Not Found)`
- `commits: status=404 (HTTPError: Not Found)`
